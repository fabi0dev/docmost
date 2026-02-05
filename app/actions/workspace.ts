'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { canManage } from '@/lib/permissions'

const updateWorkspaceSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
})

export async function updateWorkspace(data: z.infer<typeof updateWorkspaceSchema>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    const validated = updateWorkspaceSchema.parse(data)

    // Verificar permissão
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: validated.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member || !canManage(member.role)) {
      return { error: 'Sem permissão para atualizar o workspace' }
    }

    const workspace = await prisma.workspace.update({
      where: { id: validated.workspaceId },
      data: {
        name: validated.name,
        description: validated.description,
      },
    })

    revalidatePath(`/settings/workspace/${validated.workspaceId}`)
    revalidatePath(`/workspace/${validated.workspaceId}`)
    return { data: workspace }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Erro ao atualizar workspace' }
  }
}
