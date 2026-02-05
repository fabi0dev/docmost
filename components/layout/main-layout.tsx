'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileTextIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircledIcon,
  PersonIcon,
} from '@radix-ui/react-icons'

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
              <FileTextIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Docmost
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
            <QuestionMarkCircledIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors relative">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2h0V2a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2l2 4H2l2-4V2z" />
              <path d="M6 12a2 2 0 1 0 4 0" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors">
            <PersonIcon className="h-4 w-4" />
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
