import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Usuário admin criado:', admin.email)

  // Criar workspace padrão
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Workspace Padrão',
      slug: 'default',
      description: 'Workspace inicial do Docmost',
    },
  })

  console.log('✅ Workspace criado:', workspace.name)

  // Adicionar admin como owner do workspace
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: admin.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: admin.id,
      role: 'OWNER',
    },
  })

  console.log('✅ Admin adicionado ao workspace como OWNER')

  // Criar documento de exemplo
  const document = await prisma.document.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: 'bem-vindo-ao-docmost',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      title: 'Bem-vindo ao Docmost',
      slug: 'bem-vindo-ao-docmost',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Bem-vindo ao Docmost' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Este é um documento de exemplo. Você pode começar a editar agora mesmo!',
              },
            ],
          },
        ],
      },
      isPublished: true,
    },
  })

  // Criar entrada na árvore de documentos
  await prisma.documentTree.upsert({
    where: {
      documentId: document.id,
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      documentId: document.id,
      path: '1',
      depth: 0,
      order: 0,
    },
  })

  console.log('✅ Documento de exemplo criado')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de acesso:')
  console.log('   Email: admin@admin.com')
  console.log('   Senha: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
