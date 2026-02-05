'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { useDocumentStore } from '@/stores/document-store'
import { updateDocument } from '@/app/actions/documents'
import { useDebounce } from '@/hooks/use-debounce'
import { BlockMenu } from './block-menu'
import { Toolbar } from './toolbar'
import { SaveStatus } from './save-status'

export function Editor() {
  const { currentDocument, setCurrentDocument, setIsDirty, setIsSaving } = useDocumentStore()
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [editorContent, setEditorContent] = useState<any>(currentDocument?.content || null)
  const [lastSavedContent, setLastSavedContent] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: currentDocument?.content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    },
    onUpdate: ({ editor }) => {
      setIsDirty(true)
      setIsSaving(true) // Mostrar "Salvando..." imediatamente
      const content = editor.getJSON()
      setEditorContent(content)
      // Não atualizar o currentDocument aqui para evitar loops

      // Verificar se o usuário digitou "/"
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 1),
        from,
        ' '
      )
      setShowBlockMenu(textBefore === '/')
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          setShowBlockMenu(true)
        }
        if (event.key === 'Escape') {
          setShowBlockMenu(false)
        }
      },
    },
  })

  const debouncedContent = useDebounce(editorContent, 1000)

  useEffect(() => {
    if (editor && currentDocument) {
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(currentDocument.content)

      if (currentContent !== newContent && currentDocument.id) {
        editor.commands.setContent(currentDocument.content)
        setEditorContent(currentDocument.content)
        setLastSavedContent(JSON.stringify(currentDocument.content))
      }
    }
  }, [editor, currentDocument?.id])

  // Inicializar quando o documento muda
  useEffect(() => {
    if (currentDocument?.content && currentDocument.id) {
      const contentStr = JSON.stringify(currentDocument.content)
      // Só inicializar se ainda não foi inicializado ou se o documento mudou
      if (!lastSavedContent || lastSavedContent !== contentStr) {
        setEditorContent(currentDocument.content)
        setLastSavedContent(contentStr)
        setIsDirty(false)
        setIsSaving(false)
      }
    }
  }, [currentDocument?.id, currentDocument?.content])

  useEffect(() => {
    // Não salvar se não tiver conteúdo, documento ou editor
    if (!debouncedContent || !currentDocument?.id || !editor) return

    // Não salvar se não tiver lastSavedContent (primeira vez - apenas inicializar)
    if (!lastSavedContent) {
      setLastSavedContent(JSON.stringify(debouncedContent))
      setIsDirty(false)
      setIsSaving(false)
      return
    }

    // Verificar se o conteúdo realmente mudou comparando com o último conteúdo salvo
    const newContent = JSON.stringify(debouncedContent)

    // Só salvar se o conteúdo mudou
    if (lastSavedContent !== newContent) {
      const saveContent = async () => {
        try {
          const result = await updateDocument({
            documentId: currentDocument.id,
            content: debouncedContent,
          })

          if (result.error) {
            console.error('Erro ao salvar:', result.error)
            setIsSaving(false)
          } else if (result.data) {
            setIsDirty(false)
            setIsSaving(false)
            setLastSavedContent(newContent)
            // Atualizar o documento no store com o conteúdo salvo
            setCurrentDocument({
              ...currentDocument,
              content: debouncedContent,
            })
          }
        } catch (error) {
          console.error('Erro ao salvar documento:', error)
          setIsSaving(false)
        }
      }

      saveContent()
    } else {
      // Se o conteúdo não mudou, garantir que os estados estão corretos
      setIsDirty(false)
      setIsSaving(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent])

  if (!editor || !currentDocument) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Selecione um documento para editar
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-background overflow-hidden">
      {/* Title */}
      <div className="flex-shrink-0 border-b bg-gradient-to-r from-background via-background to-muted/10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              value={currentDocument.title}
              onChange={(e) => {
                setCurrentDocument({
                  ...currentDocument,
                  title: e.target.value,
                })
              }}
              onBlur={async () => {
                if (currentDocument.title) {
                  setIsDirty(true)
                  setIsSaving(true)
                  const result = await updateDocument({
                    documentId: currentDocument.id,
                    title: currentDocument.title,
                  })
                  if (result.data && !result.error) {
                    setIsDirty(false)
                  }
                  setIsSaving(false)
                }
              }}
              className="flex-1 bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground focus:text-primary transition-colors"
              placeholder="Sem título"
            />
            <SaveStatus />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <Toolbar editor={editor} />
      </div>

      {/* Editor Content - Ocupa todo o espaço restante */}
      <div className="flex-1 relative overflow-y-auto bg-background min-h-0">
        <div className="pl-8 pr-8 py-8 h-full">
          <div className="relative min-h-full">
            {showBlockMenu && editor && (
              <BlockMenu editor={editor} onClose={() => setShowBlockMenu(false)} />
            )}
            <EditorContent
              editor={editor}
              className="prose prose-slate dark:prose-invert max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full [&_.ProseMirror]:prose-p:my-2 [&_.ProseMirror]:prose-headings:my-3"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
