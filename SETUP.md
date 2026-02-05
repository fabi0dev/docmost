# 🚀 Guia Rápido de Setup

## Passo a Passo

### 1. Instalar Dependências
```bash
yarn install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o `.env` e configure:
- `DATABASE_URL` - URL de conexão do PostgreSQL
- `NEXTAUTH_SECRET` - Gere uma chave secreta (pode usar: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL da aplicação (http://localhost:3000 para dev)

### 3. Iniciar PostgreSQL com Docker
```bash
docker-compose up -d
```

Aguarde alguns segundos para o banco inicializar.

### 4. Executar Migrations
```bash
yarn db:migrate
```

Quando perguntado sobre o nome da migration, pode usar: `init`

### 5. Popular Banco com Dados Iniciais
```bash
yarn db:seed
```

Isso criará:
- Usuário admin: `admin@admin.com` / `admin123`
- Workspace padrão
- Documento de exemplo

### 6. Iniciar Servidor de Desenvolvimento
```bash
yarn dev
```

### 7. Acessar a Aplicação
Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🔧 Comandos Úteis

### Parar o PostgreSQL
```bash
docker-compose down
```

### Ver logs do PostgreSQL
```bash
docker-compose logs -f postgres
```

### Resetar o banco (CUIDADO: apaga todos os dados)
```bash
docker-compose down -v
docker-compose up -d
yarn db:migrate
yarn db:seed
```

### Abrir Prisma Studio (interface visual do banco)
```bash
yarn db:studio
```

## 🐛 Troubleshooting

### Erro de conexão com o banco
- Verifique se o Docker está rodando: `docker ps`
- Verifique se o container está ativo: `docker-compose ps`
- Verifique os logs: `docker-compose logs postgres`

### Erro ao executar migrations
- Certifique-se de que o PostgreSQL está rodando
- Verifique a `DATABASE_URL` no `.env`
- Tente resetar: `docker-compose down -v && docker-compose up -d`

### Porta 3000 já em uso
- Altere a porta no comando: `PORT=3001 yarn dev`
- Ou pare o processo que está usando a porta 3000

## 📝 Próximos Passos

Após o setup inicial:
1. Faça login com as credenciais do admin
2. Explore o workspace padrão
3. Crie novos documentos
4. Experimente o editor
