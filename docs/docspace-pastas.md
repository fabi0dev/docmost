# Uso das pastas Docspace

## `app/api/docspace/` — **Necessária**

Contém as rotas de API do app Docspace, usadas pelo front:

| Rota | Uso |
|------|-----|
| `GET/POST /api/docspace/projects` | `use-projects.ts` (listar/criar projetos por workspace) |
| `GET/POST /api/docspace/chat/sessions` | `use-chat-session.ts` (sessões e completion do chat) |
| `GET/PATCH /api/docspace/chat/sessions/[id]` | Atualizar sessão (ex.: remover documento do contexto) |
| `GET/POST .../messages` | Mensagens da sessão |
| `POST .../completion` | Resposta da IA (Groq) |

**Conclusão:** Manter. É a API do Docspace.

---

## `app/docspace/` — **Legado; pode ser simplificado**

- **page.tsx:** só faz `redirect('/dashboard')`. Comentário no código: entrada antiga; fluxo atual é Dashboard → workspace → apps.
- **layout.tsx:** re-exporta o layout do Docspace, mas como a única página redireciona, esse layout nunca é usado para conteúdo.
- Nenhum link do app aponta para `/docspace`; o registry define que o app no workspace é `/workspace/[workspaceId]`.

**Conclusão:** Manter apenas `page.tsx` para quem acessar ou tiver link antigo para `/docspace` (redireciona para dashboard). O `layout.tsx` pode ser removido.
