'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/ui-store'
import {
  FileText,
  MagnifyingGlass,
  Question,
  User,
  Bell,
  Gear,
  Users,
  Palette,
  SignOut,
  Moon,
  Sun,
  Desktop,
} from '@phosphor-icons/react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { currentWorkspace } = useWorkspaceStore()
  const { theme, setTheme } = useUIStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      // TODO: implementar abertura do modal/busca global
    }
  }

  const isCurrentTheme = (value: 'light' | 'dark' | 'system') => theme === value

  return (
    <div className="flex h-screen flex-col bg-background" onKeyDown={handleKeyDown}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm px-6 py-3 z-10">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/home')}>
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" weight="bold" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Amby
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Buscar... ⌘K"
              className="w-full pl-9 bg-muted/60 border-muted hover:bg-muted/80 focus:bg-background focus:border-primary/50 transition-all shadow-sm"
            // TODO: integrar com componente de busca global
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Question className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsUserMenuOpen((open) => !open)}
            >
              <User className="h-4 w-4" />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-popover shadow-lg py-2 z-50">
                <div className="px-4 pb-2 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Espaço de Trabalho
                  </p>
                </div>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    if (currentWorkspace) {
                      router.push(`/settings/workspace/${currentWorkspace.id}`)
                    }
                  }}
                >
                  <Gear className="h-4 w-4" />
                  <span>Configurações do workspace</span>
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    if (currentWorkspace) {
                      router.push(`/settings/workspace/${currentWorkspace.id}/members`)
                    }
                  }}
                >
                  <Users className="h-4 w-4" />
                  <span>Gerenciar membros</span>
                </button>

                <div className="my-2 border-t" />

                <div className="px-4 pb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Conta
                  </p>
                </div>
                <div className="px-4 pb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {session?.user?.name?.[0]?.toUpperCase() ||
                      session?.user?.email?.[0]?.toUpperCase() ||
                      '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {session?.user?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-3 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Tema
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        isCurrentTheme('light')
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background text-muted-foreground hover:bg-accent/40'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>Claro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        isCurrentTheme('dark')
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background text-muted-foreground hover:bg-accent/40'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>Escuro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        isCurrentTheme('system')
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background text-muted-foreground hover:bg-accent/40'
                      }`}
                    >
                      <Desktop className="h-3.5 w-3.5" />
                      <span>Sistema</span>
                    </button>
                  </div>
                </div>

                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    router.push('/settings/user')
                  }}
                >
                  <User className="h-4 w-4" />
                  <span>Meu perfil</span>
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    router.push('/settings/preferences')
                  }}
                >
                  <Palette className="h-4 w-4" />
                  <span>Minhas preferências</span>
                </button>

                <div className="my-2 border-t" />

                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    signOut()
                  }}
                >
                  <SignOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {children}
      </div>
    </div>
  )
}

