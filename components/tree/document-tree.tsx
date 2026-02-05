'use client'

import { useState } from 'react'
import { useDocumentTree } from '@/hooks/use-documents'
import { useDocumentStore } from '@/stores/document-store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createDocument, deleteDocument } from '@/app/actions/documents'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { DotsThree, Plus } from '@phosphor-icons/react'

interface TreeNode {
  id: string
  documentId: string
  parentId: string | null
  path: string
  depth: number
  order: number
  document: {
    id: string
    title: string
    slug: string
    updatedAt: string
  }
}

function TreeItem({ node, workspaceId }: { node: TreeNode; workspaceId: string }) {
  const { setCurrentDocument, currentDocument } = useDocumentStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isActive = currentDocument?.id === node.document.id
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleClick = async () => {
    router.push(`/workspace/${workspaceId}/${node.document.slug}`)
  }

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen((prev) => !prev)
  }

  const handleDeleteDocument = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)

    const confirmed = window.confirm('Tem certeza que deseja excluir esta página?')
    if (!confirmed) return

    const result = await deleteDocument(node.documentId)

    if (result?.success) {
      if (currentDocument?.id === node.document.id) {
        setCurrentDocument(null)
        router.push(`/workspace/${workspaceId}`)
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.tree(workspaceId).queryKey,
      })
    }
  }

  return (
    <div className="select-none">
      <div
        className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 transition-all group cursor-pointer ${isActive
          ? 'bg-primary/20 border-l-2 border-primary text-primary'
          : 'hover:bg-primary/10'
          }`}
        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
      >
        <span
          className={`text-xs transition-colors ${isActive
            ? 'text-primary'
            : 'text-primary/60 group-hover:text-primary'
            }`}
        >
          •
        </span>
        <button
          onClick={handleClick}
          className={`flex-1 text-left text-sm font-medium transition-colors ${isActive
            ? 'text-primary font-semibold'
            : 'text-foreground hover:text-primary'
            }`}
        >
          {node.document.title}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 transition-all hover:bg-primary/20 hover:text-primary ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          onClick={handleToggleMenu}
        >
          <DotsThree className="h-3 w-3" weight="bold" />
        </Button>

        {isMenuOpen && (
          <div className="absolute right-2 top-8 z-20 min-w-[140px] rounded-md border bg-popover py-1 shadow-md">
            <button
              className="flex w-full items-center px-3 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={handleDeleteDocument}
            >
              Excluir página
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function DocumentTree({ workspaceId }: { workspaceId: string }) {
  const { data: tree, isLoading } = useDocumentTree(workspaceId)
  const queryClient = useQueryClient()

  const handleNewDocument = async () => {
    const result = await createDocument({
      workspaceId,
      title: 'Novo Documento',
    })

    if (result.data) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.tree(workspaceId).queryKey,
      })
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/30 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2.5 bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-sm font-semibold text-foreground">Páginas</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleNewDocument}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Carregando...</div>
        ) : tree && tree.length > 0 ? (
          <div className="space-y-0.5">
            {tree.map((node: TreeNode) => (
              <TreeItem key={node.id} node={node} workspaceId={workspaceId} />
            ))}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Nenhum documento ainda. Crie um novo!
          </div>
        )}
      </div>
    </div>
  )
}
