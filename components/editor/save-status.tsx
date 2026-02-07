'use client'

import { useEffect, useState } from 'react'
import { useDocumentStore } from '@/stores/document-store'
import { CheckCircle, WifiSlash } from '@phosphor-icons/react'

export function SaveStatus() {
  const { isDirty, isSaving } = useDocumentStore()
  const [isOnline, setIsOnline] = useState(
    () => (typeof window !== 'undefined' ? navigator.onLine : true)
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <WifiSlash size={22} weight="duotone" />
        <span className="font-medium">Sem conexão</span>
      </div>
    )
  }

  if (isSaving || isDirty) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-500">
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="font-medium">Salvando...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-500">
      <CheckCircle size={22} weight="fill" />
      <span className="font-medium">Salvo</span>
    </div>
  )
}
