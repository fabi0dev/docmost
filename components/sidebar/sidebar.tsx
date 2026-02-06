'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUIStore } from '@/stores/ui-store'
import { House, MagnifyingGlass, Gear, Plus } from '@phosphor-icons/react'
import { createDocument } from '@/app/actions/documents'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/components/ui/use-toast'
import { DocumentTree } from '@/components/tree/document-tree'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SidebarUserFooter } from './sidebar-user-footer'
import { SIDEBAR_NAV_ITEM, SIDEBAR_NAV_ITEM_ACTIVE, SIDEBAR_HOME_BUTTON } from './sidebar-constants'
import { cn } from '@/lib/utils'

interface SidebarProps {
  workspaceId?: string
  hasDocument?: boolean
}

export function Sidebar({ workspaceId: workspaceIdProp, hasDocument = false }: SidebarProps) {
  const { currentWorkspace } = useWorkspaceStore()
  const setSearchOpen = useUIStore((s) => s.setSearchOpen)
  const router = useRouter()
  const workspaceId = workspaceIdProp ?? currentWorkspace?.id
  const isOverview = !!workspaceId && !hasDocument
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isCreatingPage, setIsCreatingPage] = useState(false)

  const handleSearch = () => {
    setSearchOpen(true)
  }

  const handleNewPage = async () => {
    if (!currentWorkspace) return
    setIsCreatingPage(true)
    try {
      const result = await createDocument({
        workspaceId: currentWorkspace.id,
        title: 'Nova Página',
      })
      if (result.data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.documents.tree(currentWorkspace.id).queryKey,
        })
        toast({ title: 'Página criada' })
        router.push(`/workspace/${currentWorkspace.id}/${result.data.id}`)
      } else {
        toast({
          title: 'Erro',
          description: result.error ?? 'Não foi possível criar a página',
          variant: 'destructive',
        })
      }
    } finally {
      setIsCreatingPage(false)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm animate-fade-in">
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col flex-1 min-h-0 p-4 space-y-1">
          <Button variant="ghost" asChild className={SIDEBAR_HOME_BUTTON}>
            <Link href="/home">
              <House size={22} />
              Início
            </Link>
          </Button>

          {currentWorkspace && (
            <div className="flex flex-col flex-1 min-h-0 pt-4 space-y-4 animate-fade-in-up">
              <div className="flex-shrink-0">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Geral
                </div>
                <div className="mt-1 space-y-0.5">
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(SIDEBAR_NAV_ITEM, isOverview && SIDEBAR_NAV_ITEM_ACTIVE)}
                  >
                    <Link href={workspaceId ? `/workspace/${workspaceId}` : '#'}>
                      <House size={22} />
                      Visão geral
                    </Link>
                  </Button>
                  <Button variant="ghost" className={SIDEBAR_NAV_ITEM} onClick={handleSearch}>
                    <MagnifyingGlass size={22} />
                    Buscar
                  </Button>
                  <Button variant="ghost" asChild className={SIDEBAR_NAV_ITEM}>
                    <Link href={`/settings/workspace/${currentWorkspace.id}`}>
                      <Gear size={22} />
                      Workspace
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className={SIDEBAR_NAV_ITEM}
                    onClick={handleNewPage}
                    disabled={isCreatingPage}
                  >
                    {isCreatingPage ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Plus size={22} />
                    )}
                    {isCreatingPage ? 'Criando...' : 'Criar página'}
                  </Button>
                </div>
              </div>
              <DocumentTree workspaceId={currentWorkspace.id} />
            </div>
          )}
        </div>
      </div>

      <SidebarUserFooter />
    </div>
  )
}
