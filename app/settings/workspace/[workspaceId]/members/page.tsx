import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MainLayout } from '@/components/layout/main-layout'
import { WorkspaceMembersPage } from '@/components/pages/workspace-members-page'

export default async function WorkspaceMembersRoute({
  params,
}: {
  params: { workspaceId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.workspaceId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  })

  if (!workspace) {
    redirect('/home')
  }

  return (
    <MainLayout>
      <WorkspaceMembersPage workspace={workspace} />
    </MainLayout>
  )
}

