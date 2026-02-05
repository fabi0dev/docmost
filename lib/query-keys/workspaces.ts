import { createQueryKeys } from '@lukemorales/query-key-factory'

export const workspaces = createQueryKeys('workspaces', {
  all: () => ({
    queryKey: [],
    queryFn: null,
  }),
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: null,
  }),
  members: (workspaceId: string) => ({
    queryKey: [workspaceId, 'members'],
    queryFn: null,
  }),
})
