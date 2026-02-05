import { create } from 'zustand'
import { Document } from '@prisma/client'

interface DocumentState {
  currentDocument: (Document & { content: any }) | null
  setCurrentDocument: (document: (Document & { content: any }) | null) => void
  isDirty: boolean
  isSaving: boolean
  setIsDirty: (dirty: boolean) => void
  setIsSaving: (saving: boolean) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  currentDocument: null,
  setCurrentDocument: (document) => set({ currentDocument: document, isDirty: false, isSaving: false }),
  isDirty: false,
  isSaving: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),
}))
