'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { DocumentTree } from '@/components/tree/document-tree'
import { Editor } from '@/components/editor/editor'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useDocumentStore } from '@/stores/document-store'
import { useWorkspace } from '@/hooks/use-workspace'
import { useDocument } from '@/hooks/use-documents'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { Toaster } from '@/components/ui/toaster'

export function WorkspaceLayout({
  workspaceId,
  documentSlug,
}: {
  workspaceId: string
  documentSlug?: string
}) {
  const { data: workspace } = useWorkspace(workspaceId)
  const { data: document } = useDocument(workspaceId, documentSlug || '')
  const { setCurrentWorkspace } = useWorkspaceStore()
  const { setCurrentDocument } = useDocumentStore()

  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace(workspace)
    }
  }, [workspace, setCurrentWorkspace])

  useEffect(() => {
    if (document) {
      setCurrentDocument(document)
    } else if (!documentSlug) {
      setCurrentDocument(null)
    }
  }, [document, documentSlug, setCurrentDocument])

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <DocumentTree workspaceId={workspaceId} />
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <Editor />
      </div>
      <Toaster />
    </div>
  )
}
