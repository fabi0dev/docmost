import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(workspaceId).queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`)
      if (!res.ok) throw new Error('Erro ao buscar workspace')
      return res.json()
    },
    enabled: !!workspaceId,
  })
}
