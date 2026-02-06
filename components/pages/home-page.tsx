'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createDocument } from '@/app/actions/documents'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUIStore } from '@/stores/ui-store'
import { useToast } from '@/components/ui/use-toast'
import { Plus, MagnifyingGlass, FileText } from '@phosphor-icons/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Workspace {
  id: string
  name: string
  documents: Array<{
    id: string
    title: string
    slug: string
    updatedAt: Date
  }>
}

interface RecentDocument {
  id: string
  title: string
  slug: string
  updatedAt: Date
  workspace: {
    id: string
    name: string
  }
}

export function HomePage({
  userName,
  workspaces,
  recentDocuments,
}: {
  userName: string
  workspaces: Workspace[]
  recentDocuments: RecentDocument[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore()
  const [isCreating, setIsCreating] = useState(false)

  // Define um workspace padrão no store quando estiver na Home
  useEffect(() => {
    if (!workspaces.length) return
    if (!currentWorkspace || !workspaces.some((w) => w.id === currentWorkspace.id)) {
      // Os tipos podem não bater 100% entre Prisma e o tipo local,
      // mas para o store basta garantir id e name.
      setCurrentWorkspace({
        ...(currentWorkspace as any),
        ...workspaces[0],
      } as any)
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace])

  const handleNewPage = async () => {
    const workspaceId = currentWorkspace?.id || workspaces[0]?.id
    if (!workspaceId) return
    setIsCreating(true)
    try {
      const result = await createDocument({
        workspaceId,
        title: 'Nova Página',
      })
      if (result.data) {
        toast({ title: 'Página criada' })
        router.push(`/workspace/${workspaceId}/${result.data.id}?focus=title`)
      } else {
        toast({
          title: 'Erro',
          description: result.error ?? 'Não foi possível criar a página',
          variant: 'destructive',
        })
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleViewDocument = (workspaceId: string, documentId: string) => {
    router.push(`/workspace/${workspaceId}/${documentId}`)
  }

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="border-b px-6 py-3">
        <span className="text-sm text-muted-foreground">Início</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-10">
          {/* Saudação + ação principal */}
          <section className="animate-fade-in-up">
            <h1 className="text-2xl font-semibold text-foreground mb-6">
              Olá, {userName}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleNewPage}
                size="default"
                className="gap-2"
                disabled={isCreating}
              >
                {isCreating ? (
                  <LoadingSpinner size="sm" className="h-4 w-4 border-current" />
                ) : (
                  <Plus size={18} />
                )}
                Nova página
              </Button>
              <Button
                variant="outline"
                size="default"
                className="gap-2"
                onClick={() => setSearchOpen(true)}
              >
                <MagnifyingGlass size={18} />
                Buscar
              </Button>
            </div>
          </section>

          {/* Recentes */}
          {recentDocuments.length > 0 && (
            <section className="animate-fade-in-up">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Recentes
              </h2>
              <ul className="space-y-1">
                {recentDocuments.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => handleViewDocument(doc.workspace.id, doc.id)}
                      className="flex items-center gap-3 w-full rounded-lg border bg-card px-4 py-3 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FileText size={18} className="text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium truncate block">{doc.title}</span>
                        <span className="text-xs text-muted-foreground">{doc.workspace.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Espaços */}
          {workspaces.length > 0 && (
            <section className="animate-fade-in-up">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Seus espaços
              </h2>
              <ul className="space-y-1">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/workspace/${workspace.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-medium">{workspace.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {workspace.documents.length} página{workspace.documents.length !== 1 ? 's' : ''}
                    </span>
                  </Link>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
