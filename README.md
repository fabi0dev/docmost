# Docmost

Plataforma de documentação colaborativa self-hosted, similar ao Notion/Confluence, construída com Next.js.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript 100%
- **UI**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: React Query + Query Key Factory
- **Editor**: TipTap (Markdown + WYSIWYG)
- **Banco de Dados**: PostgreSQL (Docker)
- **ORM**: Prisma
- **Autenticação**: NextAuth (JWT) + RBAC
- **Validação**: Zod

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd docmost
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://docmost:docmost@localhost:5432/docmost?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

4. Inicie o PostgreSQL com Docker:
```bash
docker-compose up -d
```

5. Execute as migrations do Prisma:
```bash
yarn db:migrate
```

6. Execute o seed inicial:
```bash
yarn db:seed
```

7. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔐 Credenciais Padrão

Após executar o seed:
- **Email**: admin@admin.com
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
docmost/
├── app/                    # Next.js App Router
│   ├── api/               # Route Handlers (REST)
│   ├── actions/           # Server Actions
│   ├── workspace/        # Páginas do workspace
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── editor/           # Editor TipTap
│   ├── sidebar/          # Sidebar
│   ├── tree/             # Árvore de documentos
│   └── layout/           # Layouts
├── lib/                  # Utilitários e configurações
├── stores/               # Stores Zustand
├── hooks/                # Custom hooks
├── prisma/               # Schema e migrations
└── types/                # TypeScript types
```

## 🎯 Funcionalidades

### ✅ Implementadas

- ✅ Autenticação com NextAuth
- ✅ Workspaces
- ✅ Documentos hierárquicos
- ✅ Editor TipTap com autosave
- ✅ Versionamento de documentos
- ✅ Permissões RBAC
- ✅ Layout 3 colunas (sidebar / tree / editor)
- ✅ Dark mode
- ✅ Busca de documentos

### 🚧 Em Desenvolvimento

- Comentários inline
- Compartilhamento por link
- Busca full-text avançada
- Realtime colaborativo
- Histórico de versões visual

## 🔧 Scripts Disponíveis

- `yarn dev` - Inicia o servidor de desenvolvimento
- `yarn build` - Build para produção
- `yarn start` - Inicia o servidor de produção
- `yarn db:migrate` - Executa migrations do Prisma
- `yarn db:generate` - Gera o Prisma Client
- `yarn db:seed` - Executa o seed inicial
- `yarn db:studio` - Abre o Prisma Studio

## 🐳 Docker

O projeto usa Docker Compose para o PostgreSQL:

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f postgres
```

## 📝 Licença

Este projeto é open-source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
