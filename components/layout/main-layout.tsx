'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  MagnifyingGlass,
  Question,
  User,
  Bell,
} from '@phosphor-icons/react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
  }

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
              Docmost
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
              onFocus={() => setSearchOpen(true)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors">
            <Question className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => router.push('/settings/user')}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {children}
      </div>
    </div>
  )
}
