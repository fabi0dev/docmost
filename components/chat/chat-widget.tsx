'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowsInSimple, ArrowsOutSimple, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ChatWidgetProps, ChatAction, OpenDocumentAction } from './chat-types'
import { useChatSession } from './use-chat-session'
import { useChatApplyToDocument } from './use-chat-apply-to-document'
import { ChatMessagesList } from './chat-messages-list'
import { ChatInputForm } from './chat-input-form'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createWorkspace } from '@/app/actions/workspace'
import { createDocument } from '@/app/actions/documents'

export function ChatWidget({ open, onOpenChange }: ChatWidgetProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [executingAction, setExecutingAction] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleOpenDocument = (payload: OpenDocumentAction) => {
    router.push(`/workspace/${payload.workspaceId}/${payload.documentId}`)
    onOpenChange(false)
  }

  const handleExecuteChatAction = async (action: ChatAction) => {
    if (executingAction) return
    setExecutingAction(true)
    try {
      if (action.type === 'create_workspace') {
        const result = await createWorkspace({ name: action.name })
        if (result.data) {
          toast({ title: 'Workspace criado' })
          router.push(`/workspace/${result.data.id}`)
          onOpenChange(false)
        } else {
          toast({
            title: 'Erro',
            description: result.error ?? 'Não foi possível criar o workspace',
            variant: 'destructive',
          })
        }
      } else if (action.type === 'create_document') {
        const result = await createDocument({
          workspaceId: action.workspaceId,
          title: action.title,
        })
        if (result.data) {
          toast({ title: 'Página criada' })
          router.push(`/workspace/${action.workspaceId}/${result.data.id}`)
          onOpenChange(false)
        } else {
          toast({
            title: 'Erro',
            description: result.error ?? 'Não foi possível criar a página',
            variant: 'destructive',
          })
        }
      }
    } finally {
      setExecutingAction(false)
    }
  }

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const {
    messages,
    setMessages,
    input,
    setInput,
    isSending,
    isLoading,
    error,
    subtitle,
    contextDocumentTitle,
    clearContext,
    listRef,
    handleSend,
    handleKeyDown,
  } = useChatSession({ open })

  const { applyingMessageId, canApplyToDocument, handleApplyToDocument } =
    useChatApplyToDocument({ setMessages })

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={() => onOpenChange(false)}
      />

      <TooltipProvider delayDuration={300}>
      <div
        className={`fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded
            ? 'inset-x-4 bottom-8 top-16 md:inset-x-auto md:right-10 md:bottom-10 md:top-auto md:h-[600px] md:w-[720px] md:max-w-[720px]'
            : 'bottom-6 right-6 w-full max-w-md md:max-w-lg min-h-[360px] md:min-h-[420px] max-h-[85vh]'
          } ${open ? 'animate-fade-in-up' : ''}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-card/80 px-4 py-2.5 backdrop-blur">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">Chat com IA</span>
              {contextDocumentTitle && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  <span className="max-w-[120px] truncate" title={contextDocumentTitle}>
                    {contextDocumentTitle}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => void clearContext()}
                        className="rounded p-0.5 hover:bg-muted-foreground/20 hover:text-foreground"
                        aria-label="Remover contexto"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Remover contexto do documento</TooltipContent>
                  </Tooltip>
                </span>
              )}
            </div>
            {error && (
              <span className="truncate text-[11px] text-destructive">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  {isExpanded ? (
                    <ArrowsInSimple size={18} />
                  ) : (
                    <ArrowsOutSimple size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isExpanded ? 'Recolher' : 'Expandir'}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  <X size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fechar chat</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-8">
            <LoadingSpinner size="md" />
            <p className="text-sm text-muted-foreground">Carregando chat</p>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
              <ChatMessagesList
                growWithContent={!isExpanded}
                messages={messages}
                listRef={listRef}
                isSending={isSending}
                isLoading={isLoading}
                canApplyToDocument={canApplyToDocument}
                applyingMessageId={applyingMessageId}
                onApplyToDocument={handleApplyToDocument}
                onOpenDocument={handleOpenDocument}
                onSearchWorkspace={(query) =>
                  void handleSend(`Pesquise no workspace: ${query}`)
                }
                onExecuteChatAction={(action) => void handleExecuteChatAction(action)}
                executingAction={executingAction}
              />
            </div>

            <ChatInputForm
              inputRef={inputRef}
              input={input}
              isLoading={false}
              isSending={isSending}
              onInputChange={setInput}
              onSend={() => {
                void handleSend()
                inputRef.current?.focus()
              }}
              onKeyDown={(e) => {
                handleKeyDown(e)
                if (e.key === 'Enter' && !e.shiftKey) inputRef.current?.focus()
              }}
            />
          </>
        )}
      </div>
      </TooltipProvider>
    </>
  )
}

