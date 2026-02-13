import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/** Redireciona para o Docspace (lista de workspaces). Mantido para compatibilidade. */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  redirect('/workspace');
}
