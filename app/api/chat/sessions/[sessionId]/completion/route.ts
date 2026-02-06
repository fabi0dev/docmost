import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GROQ } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { ChatMessageRole } from '@prisma/client'

// Verifica se o usuário tem acesso à sessão de chat
async function ensureSessionAccess(sessionId: string, userId: string) {
  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      workspace: true,
      document: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  })

  if (!chatSession) {
    return { error: 'Sessão não encontrada' as const, status: 404 as const }
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: chatSession.workspaceId,
      userId,
    },
  })

  if (!member) {
    return { error: 'Acesso negado ao workspace' as const, status: 403 as const }
  }

  return { chatSession }
}

function buildSystemPrompt(params: {
  workspaceName?: string | null
  documentTitle?: string | null
}) {
  const { workspaceName, documentTitle } = params

  const base =
    'Você é um assistente de IA integrado ao Amby, ' +
    'uma plataforma de documentação colaborativa. ' +
    'Responda sempre em português do Brasil, de forma clara, objetiva e amigável.' +
    '\n\nUse o contexto da documentação apenas quando ele for relevante para a pergunta do usuário e evite respostas muito longas.' +
    '\n\nIMPORTANTE SOBRE FORMATAÇÃO: o conteúdo que você gerar será convertido para HTML/Tiptap depois. Use apenas Markdown simples e estável (títulos, parágrafos, listas, negrito, itálico e links). Evite tabelas complexas, colunas alinhadas manualmente e formatos que dependam de espaçamento exato, pois podem quebrar na conversão.' +
    '\n\nQuando o usuário pedir explicitamente para reorganizar, reescrever ou aplicar mudanças no documento atual (por exemplo: "organize o texto desse documento", "reescreva esse documento", "aplique no documento"), você deve:' +
    '\n1. Responder primeiro com uma explicação curta do que foi feito.' +
    '\n2. Em seguida, gerar a VERSÃO COMPLETA do documento em Markdown, dentro de um bloco de código delimitado por ```DOCUMENT_MARKDOWN e ```.' +
    '\n3. Não adicione comentários, texto extra ou outro conteúdo fora desse bloco, além da explicação inicial. O bloco DOCUMENT_MARKDOWN deve conter apenas o conteúdo final do documento.' +
    (documentTitle
      ? `\n4. NÃO inclua o título do documento ("${documentTitle}") como heading (ex.: # ${documentTitle}) dentro do bloco. O título do documento é armazenado separadamente; o conteúdo do bloco deve começar pelas seções do corpo (ex.: ## Visão geral), sem duplicar o título.`
      : '')

  const workspaceInfo = workspaceName
    ? `\n\nWorkspace atual: "${workspaceName}".`
    : ''

  const documentInfo = documentTitle
    ? `\nDocumento atual: "${documentTitle}". Use isso como contexto quando fizer sentido.`
    : ''

  return base + workspaceInfo + documentInfo
}

type DocumentsContext = {
  message: string
  hasDocuments: boolean
}

type DetectedMetric =
  | { type: 'workspace_count' }
  | { type: 'document_count' }

/** Intenção classificada pela IA a partir da última mensagem e contexto. */
export type ClassifiedIntent =
  | { intent: 'open_document'; documentTitle?: string | null }
  | { intent: 'edit_document' }
  | { intent: 'create_workspace'; name?: string }
  | { intent: 'create_document'; title?: string }
  | { intent: 'metric_question'; metric?: 'workspace_count' | 'document_count' }
  | { intent: 'chat' }

const INTENT_CLASSIFICATION_SYSTEM = `Você é um classificador de intenções para um chat de documentação. Com base na última mensagem do usuário e no contexto da última resposta do assistente, retorne APENAS um JSON válido, sem markdown e sem texto extra.

Intenções possíveis:
- open_document: usuário quer abrir, ver ou mostrar um documento/página (ex: "abrir esse doc", "abra o documento Credenciais", "mostre a página X"). Se a mensagem referir "esse doc" ou "este documento" sem nome, use o contexto da última resposta do assistente para inferir o título (ex: título de seção como "Credenciais da Vowe" ou "Credenciais").
- edit_document: usuário quer editar/organizar/reescrever/formatar o documento atual (ex: "organize esse texto", "reescreva o documento", "aplique no documento").
- create_workspace: usuário quer criar um novo workspace. Extraia o nome se mencionado.
- create_document: usuário quer criar uma nova página/documento. Extraia o título se mencionado.
- metric_question: pergunta sobre quantidade (quantos workspaces, quantos documentos, etc.). Use metric "workspace_count" ou "document_count".
- chat: conversa normal, perguntas sobre conteúdo, ou qualquer outra coisa.

Formato de resposta (apenas este JSON, nada mais):
{"intent":"<uma das intenções acima>","documentTitle":<string ou null só para open_document>,"name":<string só para create_workspace>,"title":<string só para create_document>,"metric":<"workspace_count" ou "document_count" só para metric_question>}

Regras: use apenas intent quando não houver parâmetros. Para open_document, preencha documentTitle quando possível (da mensagem ou inferido do contexto). Para create_workspace use name (default "Novo Workspace"). Para create_document use title (default "Nova Página").`

/** Classifica a intenção do usuário com IA (Groq). Retorna intent 'chat' em caso de erro ou parse inválido. */
async function classifyChatIntent(params: {
  lastUserMessage: string
  lastAssistantMessage: string | null
  apiKey: string
}): Promise<ClassifiedIntent> {
  const { lastUserMessage, lastAssistantMessage, apiKey } = params
  const client = new Groq({ apiKey })

  const userContent =
    lastAssistantMessage != null && lastAssistantMessage.trim().length > 0
      ? `Última resposta do assistente (use para inferir contexto, ex. título de documento):\n${lastAssistantMessage.slice(0, 1500)}\n\n---\nMensagem atual do usuário:\n${lastUserMessage}`
      : lastUserMessage

  try {
    const completion = await client.chat.completions.create({
      model: GROQ.classifyModel,
      messages: [
        { role: 'system', content: INTENT_CLASSIFICATION_SYSTEM },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 256,
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const jsonStr = raw.replace(/^```json?\s*|\s*```$/g, '').trim()
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>

    const intent = parsed.intent as string
    if (!intent || typeof intent !== 'string') {
      return { intent: 'chat' }
    }

    const normalized = intent.toLowerCase().replace(/\s+/g, '_')
    if (normalized === 'open_document') {
      return {
        intent: 'open_document',
        documentTitle: typeof parsed.documentTitle === 'string' ? parsed.documentTitle.trim() || null : null,
      }
    }
    if (normalized === 'edit_document') return { intent: 'edit_document' }
    if (normalized === 'create_workspace') {
      return {
        intent: 'create_workspace',
        name: typeof parsed.name === 'string' ? parsed.name.trim().slice(0, 100) || 'Novo Workspace' : 'Novo Workspace',
      }
    }
    if (normalized === 'create_document') {
      return {
        intent: 'create_document',
        title: typeof parsed.title === 'string' ? parsed.title.trim().slice(0, 200) || 'Nova Página' : 'Nova Página',
      }
    }
    if (normalized === 'metric_question') {
      const metric = parsed.metric === 'document_count' ? 'document_count' : 'workspace_count'
      return { intent: 'metric_question', metric }
    }
    return { intent: 'chat' }
  } catch {
    return { intent: 'chat' }
  }
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

async function answerMetricQuestion(params: {
  metric: DetectedMetric
  workspaceId: string
}) {
  const { metric, workspaceId } = params

  switch (metric.type) {
    case 'workspace_count': {
      const total = await prisma.workspaceMember.count({
        where: { userId: undefined as never },
      })
      // Fallback defensivo, mas em geral você provavelmente quer
      // contar os workspaces pela tabela Workspace.
      const workspacesTotal = await prisma.workspace.count()

      return (
        `Atualmente existem **${workspacesTotal} workspaces** cadastrados ` +
        'nesta instância do Amby.'
      )
    }
    case 'document_count': {
      const documentsTotal = await prisma.document.count({
        where: {
          workspaceId,
          deletedAt: null,
        },
      })

      return (
        `Este workspace possui **${documentsTotal} documentos** ` +
        '(considerando apenas documentos não excluídos).'
      )
    }
    default:
      return null
  }
}

function suggestsInfoNotInCurrentDocument(message: string): boolean {
  const normalized = normalizeText(message)
  return (
    normalized.includes('nao esta documentado aqui') ||
    normalized.includes('nao esta registrado') ||
    normalized.includes('nao encontrei') ||
    normalized.includes('nao consta') ||
    normalized.includes('nao foi encontrado') ||
    normalized.includes('nao esta registrada') ||
    normalized.includes('nao esta documentada') ||
    normalized.includes('nao esta na documentacao') ||
    normalized.includes('nao esta neste documento') ||
    normalized.includes('nao esta no documento') ||
    normalized.includes('nao ha informacao') ||
    normalized.includes('nao ha informacoes')
  )
}

function extractPlainTextFromContent(content: any): string {
  if (!content) return ''

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content.map(extractPlainTextFromContent).join(' ')
  }

  if (typeof content === 'object') {
    let text = ''

    if (typeof (content as any).text === 'string') {
      text += (content as any).text + ' '
    }

    if (Array.isArray((content as any).content)) {
      text += extractPlainTextFromContent((content as any).content)
    }

    return text
  }

  return ''
}

function documentContentToMarkdown(content: unknown): string {
  if (!content || typeof content !== 'object') return ''

  const doc = content as { content?: Array<Record<string, unknown>> }
  const parts: string[] = []

  const visit = (nodes: Array<Record<string, unknown>>, listPrefix = '') => {
    for (const node of nodes) {
      const type = node.type as string
      const inner = (node.content as Array<Record<string, unknown>>) || []

      if (type === 'paragraph') {
        const text = inner.map((c) => (c.text as string) || '').join('')
        if (text.trim()) {
          parts.push(listPrefix ? `${listPrefix} ${text}` : text)
        }
      } else if (type === 'heading') {
        const attrs = node.attrs as { level?: number } | undefined
        const level = attrs?.level ?? 1
        const text = inner.map((c) => (c.text as string) || '').join('')
        parts.push(`${'#'.repeat(level)} ${text}`)
      } else if (type === 'bulletList' || type === 'orderedList') {
        const isOrdered = type === 'orderedList'
        inner.forEach((item, i) => {
          const prefix = isOrdered ? `${i + 1}.` : '-'
          visit((item.content as Array<Record<string, unknown>>) || [], prefix)
        })
      } else if (type === 'blockquote') {
        const text = inner.map((c) => (c.text as string) || '').join('')
        parts.push(`> ${text}`)
      } else {
        visit(inner, listPrefix)
      }
    }
  }

  if (Array.isArray(doc.content)) visit(doc.content)
  return parts.filter(Boolean).join('\n\n')
}

async function buildDocumentsContext(params: {
  userId: string
  documentId?: string | null
  userQuery: string
}): Promise<DocumentsContext | null> {
  const { userId, documentId, userQuery } = params

  const cleanedQuery = userQuery.trim()
  if (!cleanedQuery) return null

  const members = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  })
  const workspaceIds = members.map((m) => m.workspaceId)
  if (workspaceIds.length === 0) return null

  const queryForSearch =
    cleanedQuery.length > 200 ? cleanedQuery.slice(0, 200) : cleanedQuery

  const keywords = queryForSearch
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[.,;!?()"'`]/g, ''))
    .filter((word) => word.length >= 3)

  const whereByKeywords =
    keywords.length > 0
      ? {
          OR: keywords.map((term) => ({
            OR: [
              {
                title: {
                  contains: term,
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: term,
                  mode: 'insensitive',
                },
              },
            ],
          })),
        }
      : {
          OR: [
            {
              title: {
                contains: queryForSearch,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: queryForSearch,
                mode: 'insensitive',
              },
            },
          ],
        }

  const baseWhere: any = {
    document: {
      workspaceId: workspaceIds.length === 1 ? workspaceIds[0] : { in: workspaceIds },
      deletedAt: null,
    },
    ...whereByKeywords,
  }

  const [currentDocMatches, otherDocsMatches] = await Promise.all([
    documentId
      ? prisma.documentFullText.findMany({
          where: {
            ...baseWhere,
            documentId,
          },
          select: {
            documentId: true,
            title: true,
            content: true,
          },
          take: 3,
        })
      : Promise.resolve([]),
    prisma.documentFullText.findMany({
      where: documentId
        ? {
            ...baseWhere,
            documentId: { not: documentId },
          }
        : baseWhere,
      select: {
        documentId: true,
        title: true,
        content: true,
      },
      take: 8,
    }),
  ])

  const seen = new Set<string>()
  const fullTextDocs = [...currentDocMatches, ...otherDocsMatches].filter((doc) => {
    const key = doc.documentId
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 5)

  const MAX_CONTEXT_CHARS = 4000
  const MAX_PER_DOC = 800

  const parts: string[] = []

  const pushDocsToParts = (docs: Array<{ title: string; content: string }>) => {
    let totalChars = parts.reduce((acc, part) => acc + part.length, 0)

    for (const doc of docs) {
      if (totalChars >= MAX_CONTEXT_CHARS) break

      const rawContent = doc.content || ''
      const snippet =
        rawContent.length > MAX_PER_DOC
          ? `${rawContent.slice(0, MAX_PER_DOC)}…`
          : rawContent

      const block = `Título: ${doc.title}\nTrecho:\n${snippet}`
      totalChars += block.length

      if (totalChars > MAX_CONTEXT_CHARS) break
      parts.push(block)
    }
  }

  // Primeiro tentamos usar o índice de texto completo
  if (fullTextDocs.length) {
    const docsForContext = fullTextDocs.map((doc) => ({
      title: doc.title,
      content: doc.content,
    }))
    pushDocsToParts(docsForContext)
  }

  // Fallback: se nada veio do índice ou ainda não há partes suficientes,
  // buscamos diretamente nos documentos JSON e extraímos texto em memória.
  if (!parts.length) {
    const candidateDocs = await prisma.document.findMany({
      where: {
        workspaceId: workspaceIds.length === 1 ? workspaceIds[0] : { in: workspaceIds },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 80,
    })

    const keywordSet = new Set(keywords)

    const matchedDocs: Array<{ title: string; content: string }> = []

    for (const doc of candidateDocs) {
      const plainText = extractPlainTextFromContent(doc.content).toLowerCase()
      if (!plainText) continue

      const hasMatch =
        keywordSet.size === 0
          ? plainText.includes(queryForSearch.toLowerCase())
          : Array.from(keywordSet).some((term) => plainText.includes(term))

      if (!hasMatch) continue

      // Monta um snippet simples em torno do primeiro termo encontrado
      let snippet = plainText
      const terms = keywordSet.size ? Array.from(keywordSet) : [queryForSearch]
      let firstIndex = -1
      for (const term of terms) {
        const idx = plainText.indexOf(term.toLowerCase())
        if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
          firstIndex = idx
        }
      }

      if (firstIndex !== -1 && plainText.length > MAX_PER_DOC) {
        const start = Math.max(0, firstIndex - MAX_PER_DOC / 2)
        const end = Math.min(plainText.length, start + MAX_PER_DOC)
        snippet = plainText.slice(start, end)
      } else if (plainText.length > MAX_PER_DOC) {
        snippet = plainText.slice(0, MAX_PER_DOC)
      }

      matchedDocs.push({
        title: doc.title,
        content: snippet,
      })
    }

    pushDocsToParts(matchedDocs.slice(0, 5))
  }

  if (!parts.length) {
    return null
  }

  return {
    hasDocuments: true,
    message:
      'Contexto da documentação dos workspaces do usuário (trechos relevantes):\n\n' +
      parts.join('\n\n---\n\n'),
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const access = await ensureSessionAccess(params.sessionId, session.user.id)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      )
    }

    const { chatSession } = access

    const body = await request.json()
    const { messages } = body as {
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Mensagens inválidas' },
        { status: 400 }
      )
    }

    const apiKey = GROQ.apiKey
    if (!apiKey) {
      return NextResponse.json({
        message:
          'Olá! Para usar o chatbot com IA, configure a variável de ambiente GROQ_API_KEY no arquivo .env.local e reinicie o servidor. Por enquanto, esta é uma resposta de exemplo.',
        error: 'GROQ_API_KEY não configurada',
        hint:
          'Certifique-se de que o arquivo .env.local existe na raiz do projeto e reinicie o servidor Next.js',
      })
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')
    const lastAssistantMessage =
      [...messages].reverse().find((m) => m.role === 'assistant')?.content ?? null

    const classified =
      lastUserMessage != null
        ? await classifyChatIntent({
            lastUserMessage: lastUserMessage.content,
            lastAssistantMessage,
            apiKey,
          })
        : ({ intent: 'chat' as const } satisfies ClassifiedIntent)

    const isEditRequest =
      classified.intent === 'edit_document' && !!chatSession.documentId

    // Perguntas de métrica (quantidade) tratadas diretamente.
    if (lastUserMessage && classified.intent === 'metric_question') {
      const metric: DetectedMetric =
        classified.metric === 'document_count'
          ? { type: 'document_count' }
          : { type: 'workspace_count' }

      if (metric) {
        const directAnswer = await answerMetricQuestion({
          metric,
          workspaceId: chatSession.workspaceId,
        })

        if (directAnswer) {
          // Persistimos a resposta como mensagem da IA e retornamos
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              userId: null,
              role: ChatMessageRole.ASSISTANT,
              content: directAnswer,
              metadata: {
                provider: 'internal',
                reason: 'metric_question',
              } as any,
            },
          })

          await prisma.chatSession.update({
            where: { id: chatSession.id },
            data: { updatedAt: new Date() },
          })

          return NextResponse.json({ message: directAnswer })
        }
      }
    }

    // Abrir documento: ação estruturada para o frontend (botão "Abrir documento")
    if (lastUserMessage && classified.intent === 'open_document') {
      const userWorkspaceIds = (
        await prisma.workspaceMember.findMany({
          where: { userId: session.user.id },
          select: { workspaceId: true },
        })
      ).map((m) => m.workspaceId)

      const workspaceIds = userWorkspaceIds.length > 0 ? userWorkspaceIds : [chatSession.workspaceId]
      const workspaceIdWhere =
        workspaceIds.length === 1
          ? { workspaceId: workspaceIds[0] }
          : { workspaceId: { in: workspaceIds } }

      let docId: string | null = chatSession.documentId
      let docTitle: string | null = chatSession.document?.title ?? null
      let resolvedWorkspaceId: string | null = docId ? chatSession.workspaceId : null

      if (!docId) {
        const possibleTitle = classified.documentTitle?.trim() ?? null

        if (possibleTitle) {
          const byTitle = await prisma.document.findFirst({
            where: {
              ...workspaceIdWhere,
              deletedAt: null,
              title: { contains: possibleTitle, mode: 'insensitive' },
            },
            select: { id: true, title: true, workspaceId: true },
          })
          if (byTitle) {
            docId = byTitle.id
            docTitle = byTitle.title
            resolvedWorkspaceId = byTitle.workspaceId
          }
        }
        if (!docId) {
          const anyDoc = await prisma.document.findFirst({
            where: { ...workspaceIdWhere, deletedAt: null },
            select: { id: true, title: true, workspaceId: true },
            orderBy: { updatedAt: 'desc' },
          })
          if (anyDoc) {
            docId = anyDoc.id
            docTitle = anyDoc.title
            resolvedWorkspaceId = anyDoc.workspaceId
          }
        }
      } else {
        resolvedWorkspaceId = chatSession.workspaceId
      }

      if (docId && resolvedWorkspaceId) {
        const friendlyMessage =
          docTitle != null
            ? `Documento **${docTitle}** disponível. Use o botão abaixo para abri-lo no editor.`
            : 'Documento disponível. Use o botão abaixo para abri-lo no editor.'

        await prisma.chatMessage.create({
          data: {
            sessionId: chatSession.id,
            userId: null,
            role: ChatMessageRole.ASSISTANT,
            content: friendlyMessage,
            metadata: {
              provider: 'internal',
              reason: 'open_document',
              actions: [{ type: 'open_document', payload: { workspaceId: resolvedWorkspaceId, documentId: docId, documentTitle: docTitle ?? undefined } }],
            } as any,
          },
        })

        await prisma.chatSession.update({
          where: { id: chatSession.id },
          data: { updatedAt: new Date() },
        })

        return NextResponse.json({
          message: friendlyMessage,
          openDocument: {
            workspaceId: resolvedWorkspaceId,
            documentId: docId,
            ...(docTitle && { documentTitle: docTitle }),
          },
          actions: [
            {
              type: 'open_document',
              payload: {
                workspaceId: resolvedWorkspaceId,
                documentId: docId,
                documentTitle: docTitle ?? undefined,
              },
            },
          ],
        })
      }

      const noDocMessage =
        'Nenhum documento foi encontrado nos seus workspaces para abrir. Abra um documento no editor ou diga o nome (ex: "Abra o documento Credenciais").'

      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          userId: null,
          role: ChatMessageRole.ASSISTANT,
          content: noDocMessage,
          metadata: {
            provider: 'internal',
            reason: 'open_document_no_target',
          } as any,
        },
      })

      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() },
      })

      return NextResponse.json({ message: noDocMessage })
    }

    // Ações diretas: criar workspace ou página
    if (lastUserMessage && classified.intent === 'create_workspace') {
      const name = classified.name ?? 'Novo Workspace'
      const msg = `Posso criar o workspace **${name}** para você. Use o botão abaixo para confirmar.`
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          userId: null,
          role: ChatMessageRole.ASSISTANT,
          content: msg,
          metadata: { provider: 'internal', reason: 'chat_action_create_workspace' } as any,
        },
      })
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() },
      })
      return NextResponse.json({
        message: msg,
        chatAction: { type: 'create_workspace', name },
      })
    }

    if (lastUserMessage && classified.intent === 'create_document') {
      const title = classified.title ?? 'Nova Página'
      if (chatSession.workspaceId) {
        const msg = `Posso criar a página **${title}** neste workspace. Use o botão abaixo para confirmar.`
        await prisma.chatMessage.create({
          data: {
            sessionId: chatSession.id,
            userId: null,
            role: ChatMessageRole.ASSISTANT,
            content: msg,
            metadata: { provider: 'internal', reason: 'chat_action_create_document' } as any,
          },
        })
        await prisma.chatSession.update({
          where: { id: chatSession.id },
          data: { updatedAt: new Date() },
        })
        return NextResponse.json({
          message: msg,
          chatAction: {
            type: 'create_document',
            workspaceId: chatSession.workspaceId,
            title,
          },
        })
      }
      const msg =
        'Para criar uma página, selecione um workspace primeiro (por exemplo, abra um workspace na barra lateral) e peça novamente.'
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          userId: null,
          role: ChatMessageRole.ASSISTANT,
          content: msg,
          metadata: { provider: 'internal', reason: 'chat_action_create_document_no_workspace' } as any,
        },
      })
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { updatedAt: new Date() },
      })
      return NextResponse.json({ message: msg })
    }

    const systemPrompt = buildSystemPrompt({
      workspaceName: chatSession.workspace.name,
      documentTitle: chatSession.document?.title ?? null,
    })

    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt,
    }

    const contextMessages: Array<{ role: 'system'; content: string }> = [
      systemMessage,
    ]

    if (isEditRequest && chatSession.documentId) {
      const document = await prisma.document.findUnique({
        where: { id: chatSession.documentId },
      })

      if (document) {
        const markdown = documentContentToMarkdown(document.content as any)

        contextMessages.push({
          role: 'system',
          content:
            'Você tem acesso ao conteúdo COMPLETO do documento atual deste workspace. ' +
            'Use esse conteúdo como base principal para aplicar as alterações pedidas pelo usuário.' +
            '\n\nTítulo do documento: ' +
            document.title +
            '\n\nConteúdo atual em Markdown:\n\n```markdown\n' +
            markdown +
            '\n```',
        })
      }
    } else {
      const documentsContext = lastUserMessage
        ? await buildDocumentsContext({
            userId: session.user.id,
            documentId: chatSession.documentId,
            userQuery: lastUserMessage.content,
          })
        : null

      if (documentsContext?.hasDocuments) {
        contextMessages.push({
          role: 'system',
          content:
            'Foram encontrados documentos relevantes na base de conhecimento dos workspaces do usuário. ' +
            'Responda APENAS com base nas informações dos documentos abaixo. ' +
            'Se alguma informação não estiver nos documentos, diga claramente que não está documentada nos workspaces do usuário.',
        })

        contextMessages.push({
          role: 'system',
          content: documentsContext.message,
        })
      } else {
        contextMessages.push({
          role: 'system',
          content:
            'Nenhum documento relevante foi encontrado na base de conhecimento dos workspaces do usuário ' +
            'para a pergunta atual. Você pode dar orientações genéricas, mas NÃO invente valores ' +
            'específicos (como usuário, senha, URLs internas, tokens ou credenciais). ' +
            'Se precisar citar informações específicas e elas não estiverem documentadas, diga apenas ' +
            'que isso não está registrado na documentação dos workspaces do usuário.',
        })
      }
    }

    const client = new Groq({
      apiKey,
    })

    const completionMessages = [...contextMessages, ...messages]

    const paramsCompletion = {
      messages: completionMessages,
      model: GROQ.chatModel,
      temperature: 1,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
    }

    const completion = await client.chat.completions.create(
      paramsCompletion as any
    )

    const content =
      'choices' in completion
        ? completion.choices[0]?.message?.content
        : 'Desculpe, não consegui gerar uma resposta.'

    const finalMessage =
      content || 'Desculpe, não consegui gerar uma resposta.'

    let documentMarkdown: string | undefined

    // Só extraímos um markdown aplicável quando:
    // - há um documento vinculado à sessão, E
    // - a última mensagem foi identificada como pedido de edição.
    // Assim, o botão "Aplicar no documento" só aparece quando há
    // contexto claro para isso.
    if (isEditRequest && chatSession.documentId && finalMessage) {
      // 1) Tenta extrair bloco DOCUMENT_MARKDOWN explícito
      const fenced = finalMessage.match(
        /```DOCUMENT_MARKDOWN\s*([\s\S]*?)```/i
      )
      if (fenced?.[1]) {
        documentMarkdown = fenced[1].trim()
      } else {
        // 2) Se não tiver bloco explícito, tenta remover uma explicação inicial
        //    e usar a parte de markdown (por ex. começando em '#' ou '##').
        const idxHeading = finalMessage.search(/^#\s/m)
        if (idxHeading >= 0) {
          documentMarkdown = finalMessage.slice(idxHeading).trim()
        } else {
          // 3) Fallback: usa a resposta inteira como markdown.
          documentMarkdown = finalMessage.trim()
        }
      }
    }

    // Persistir mensagem da IA na sessão de chat
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        userId: null,
        role: ChatMessageRole.ASSISTANT,
        content: finalMessage,
        metadata: {
          provider: 'groq',
          model: GROQ.chatModel,
        } as any,
      },
    })

    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: { updatedAt: new Date() },
    })

    const suggestWorkspaceSearch =
      !!chatSession.documentId &&
      !!lastUserMessage?.content?.trim() &&
      suggestsInfoNotInCurrentDocument(finalMessage)

    return NextResponse.json({
      message: finalMessage,
      ...(documentMarkdown && { documentMarkdown }),
      ...(suggestWorkspaceSearch && {
        suggestWorkspaceSearch: true,
        workspaceSearchQuery: lastUserMessage!.content.trim(),
      }),
    })
  } catch (error: any) {
    // Erros de chave inválida
    if (
      error?.status === 401 ||
      error?.code === 'invalid_api_key' ||
      error?.error?.code === 'invalid_api_key'
    ) {
      return NextResponse.json(
        {
          error: 'Chave API inválida',
          message:
            'A chave API do Groq está inválida ou expirada. Verifique sua chave em https://console.groq.com/ e atualize o arquivo .env.local',
          details:
            'Invalid API Key - verifique se a chave está correta e ativa',
          hint: 'Certifique-se de que a chave começa com "gsk_" e está completa (sem espaços ou quebras de linha)',
        },
        { status: 401 }
      )
    }

    if (error?.status) {
      return NextResponse.json(
        {
          error: 'Erro na API do Groq',
          message:
            error?.error?.message || 'Erro ao processar a requisição de chat',
          details:
            error instanceof Error ? error.message : 'Erro desconhecido',
          status: error.status,
        },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro ao processar sua mensagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

