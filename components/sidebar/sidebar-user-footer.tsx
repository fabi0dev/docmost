'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function SidebarUserFooter() {
  const { data: session } = useSession()

  return (
    <>
      <Separator />
      <div className="p-4 animate-fade-in">
        <div className="mb-2 text-sm font-medium text-foreground truncate">
          {session?.user?.name || session?.user?.email}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full transition-smooth hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => signOut()}
        >
          Sair
        </Button>
      </div>
    </>
  )
}
