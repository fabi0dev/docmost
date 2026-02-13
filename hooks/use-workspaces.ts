import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function useWorkspaces() {
  return useQuery({
    queryKey: [...queryKeys.workspaces.all().queryKey],
    queryFn: async () => {
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Erro ao buscar workspaces');
      return res.json() as Promise<{ id: string; name: string }[]>;
    },
  });
}
