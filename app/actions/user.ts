'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function updateUser(data: z.infer<typeof updateUserSchema>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    const validated = updateUserSchema.parse(data)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
      },
    })

    revalidatePath('/settings/user')
    return { data: user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Erro ao atualizar usuário' }
  }
}

export async function changePassword(data: z.infer<typeof changePasswordSchema>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    const validated = changePasswordSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.password) {
      return { error: 'Usuário não encontrado' }
    }

    const isValid = await bcrypt.compare(validated.currentPassword, user.password)
    if (!isValid) {
      return { error: 'Senha atual incorreta' }
    }

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    })

    return { data: { success: true } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Erro ao alterar senha' }
  }
}
