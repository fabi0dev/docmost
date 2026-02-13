import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export async function DocspaceWorkspaceListRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: { id: true, name: true },
  });

  if (workspaces.length >= 1) {
    redirect(`/workspace/${workspaces[0].id}`);
  }

  const userName =
    session.user.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'Usuário';

  return (
    <DashboardView
      userName={userName}
      workspaces={workspaces.map((w) => ({ id: w.id, name: w.name }))}
    />
  );
}
