'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChatCircleDots } from '@phosphor-icons/react'
import { TopBar } from './top-bar'
import { useDocumentStore } from '@/stores/document-store'

interface MainLayoutContentProps {
  children: React.ReactNode
  onSearchOpen: (open: boolean) => void
  onChatOpen: (open: boolean) => void
  chatOpen: boolean
}

/** Rota é uma página de documento no workspace? /workspace/[id]/[documentId] */
function isWorkspaceDocumentPath(pathname: string | null): boolean {
  if (!pathname) return false
  const match = pathname.match(/^\/workspace\/([^/]+)\/([^/]+)$/)
  return Boolean(match && match[1] && match[2])
}

export function MainLayoutContent({
  children,
  onSearchOpen,
  onChatOpen,
  chatOpen,
}: MainLayoutContentProps) {
  const pathname = usePathname()
  const { setCurrentDocument } = useDocumentStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Ao sair da página de um documento, limpa o documento focado para o chat e editor
  useEffect(() => {
    if (!isWorkspaceDocumentPath(pathname)) {
      setCurrentDocument(null)
    }
  }, [pathname, setCurrentDocument])

  return (
    <>
      <TopBar
        onSearchClick={() => onSearchOpen(true)}
        userMenuOpen={userMenuOpen}
        onUserMenuOpenChange={setUserMenuOpen}
      />

      <div className="flex flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20 animate-fade-in">
        {children}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <Button
          size="icon"
          variant="default"
          className="h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-smooth"
          onClick={() => onChatOpen(true)}
          title="Chat com IA"
        >
          <ChatCircleDots size={24} weight="duotone" />
        </Button>
      </div>
    </>
  )
}
