import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

/** Redireciona para a home do Docspace no workspace. Mantido para compatibilidade com /w/[id]. */
export default async function WorkspaceHomePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const { workspaceId } = await params;
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { userId: session.user.id },
      },
    },
  });

  if (!workspace) redirect('/workspace');
  redirect(`/workspace/${workspaceId}`);
}
