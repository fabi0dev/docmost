'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/stores/workspace-store'
import {
  House,
  FileText,
  MagnifyingGlass,
  Gear,
  Plus,
} from '@phosphor-icons/react'
import { createDocument } from '@/app/actions/documents'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export function Sidebar() {
  const { data: session } = useSession()
  const { currentWorkspace } = useWorkspaceStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleHome = () => {
    router.push('/home')
  }

  const handleSearch = () => {
    // TODO: Implementar busca
    router.push('/home')
  }

  const handleNewPage = async () => {
    if (currentWorkspace) {
      const result = await createDocument({
        workspaceId: currentWorkspace.id,
        title: 'Nova Página',
      })
      if (result.data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.documents.tree(currentWorkspace.id).queryKey,
        })
        router.push(`/workspace/${currentWorkspace.id}/${result.data.slug}`)
      }
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm">
      {/* Header */}
      <div className="flex items-center border-b p-4 bg-gradient-to-r from-card to-card/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" weight="bold" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Amby
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {/* Home */}
          <Button
            variant="ghost"
            className="w-full justify-start font-medium gap-2 h-9 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleHome}
          >
            <House className="h-4 w-4" />
            Início
          </Button>

          {/* Geral Section */}
          {currentWorkspace && (
            <div className="pt-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Geral
              </div>
              <div className="mt-1 space-y-0.5">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2 h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary transition-all"
                  onClick={handleHome}
                >
                  <House className="h-3.5 w-3.5" />
                  Visão Geral
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2 h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary transition-all"
                  onClick={handleSearch}
                >
                  <MagnifyingGlass className="h-3.5 w-3.5" />
                  Buscar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2 h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary transition-all"
                  onClick={() => router.push(`/settings/workspace/${currentWorkspace.id}`)}
                >
                  <Gear className="h-3.5 w-3.5" />
                  Configurações do Espaço
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2 h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary transition-all"
                  onClick={handleNewPage}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova Página
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Separator />
      <div className="p-4">
        <div className="mb-2 text-sm font-medium text-foreground">
          {session?.user?.name || session?.user?.email}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => signOut()}
        >
          Sair
        </Button>
      </div>
    </div>
  )
}
