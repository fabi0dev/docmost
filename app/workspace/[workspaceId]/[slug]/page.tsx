import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { MainLayout } from '@/components/layout/main-layout'

export default async function DocumentPage({
  params,
}: {
  params: { workspaceId: string; slug: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const document = await prisma.document.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId: params.workspaceId,
        slug: params.slug,
      },
    },
    include: {
      workspace: {
        include: {
          members: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  })

  if (!document || document.deletedAt) {
    redirect(`/workspace/${params.workspaceId}`)
  }

  if (document.workspace.members.length === 0) {
    redirect('/home')
  }

  return (
    <MainLayout>
      <WorkspaceLayout workspaceId={params.workspaceId} documentSlug={params.slug} />
    </MainLayout>
  )
}
