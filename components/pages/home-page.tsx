'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createDocument } from '@/app/actions/documents'
import { useWorkspaceStore } from '@/stores/workspace-store'
import {
  Plus,
  MagnifyingGlass,
  FileText,
  Star,
} from '@phosphor-icons/react'

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
  workspaces,
  recentDocuments,
}: {
  workspaces: Workspace[]
  recentDocuments: RecentDocument[]
}) {
  const router = useRouter()
  const { currentWorkspace } = useWorkspaceStore()

  const handleNewDocument = async () => {
    const workspaceId = currentWorkspace?.id || workspaces[0]?.id
    if (workspaceId) {
      const result = await createDocument({
        workspaceId,
        title: 'Novo Documento',
      })
      if (result.data) {
        router.push(`/workspace/${workspaceId}/${result.data.slug}`)
      }
    }
  }

  const handleViewDocument = (workspaceId: string, slug: string) => {
    router.push(`/workspace/${workspaceId}/${slug}`)
  }

  return (
    <div className="flex flex-1 flex-col w-full">
      {/* Breadcrumbs */}
      <div className="border-b px-6 py-3">
        <div className="text-sm text-muted-foreground">
          &gt; Home
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex">
        <div className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Star className="h-8 w-8 text-primary" weight="fill" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold">Bem-vindo ao Amby</h1>
            <p className="mb-6 text-muted-foreground">
              Pressione Ctrl + K para buscar
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleNewDocument} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Novo Documento
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <MagnifyingGlass className="h-5 w-5" />
                Ver Todos os Documentos
              </Button>
            </div>
          </div>

          {/* Recent Documents */}
          {recentDocuments.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Vistos recentemente</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold line-clamp-2">{doc.title}</h3>
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {doc.workspace.name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewDocument(doc.workspace.id, doc.slug)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workspaces Section */}
          {workspaces.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-xl font-semibold">Espaços de Trabalho</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/workspace/${workspace.id}`)}
                  >
                    <h3 className="mb-2 font-semibold">{workspace.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {workspace.documents.length} documento{workspace.documents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
