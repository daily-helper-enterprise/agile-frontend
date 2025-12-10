# Configuração da API

Este projeto foi atualizado para se conectar a uma API real ao invés de usar dados mockados no localStorage.

## Variáveis de Ambiente

### Configuração Necessária

Crie um arquivo `.env.local` na raiz do projeto com a seguinte variável:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Importante:** Substitua a URL pela URL real da sua API backend.

### Arquivo de Exemplo

Um arquivo `.env.example` está incluído no projeto como referência. Copie-o para criar seu `.env.local`:

```bash
cp .env.example .env.local
```

## Endpoints da API

A aplicação espera que a API backend implemente os seguintes endpoints:

### Autenticação

| Método | Endpoint         | Body                        | Resposta                               | Auth |
| ------ | ---------------- | --------------------------- | -------------------------------------- | ---- |
| POST   | `/auth/login`    | `{ username, password }`    | `{ token, user: { id, name, email } }` | Não  |
| POST   | `/auth/register` | `{ name, username, email, password }` | `{ token, user: { id, name, email } }` | Não  |
| GET    | `/auth/login/me` | -                           | `{ id, name, email }`                  | Sim  |

### Quadros/Times (Teams)

| Método | Endpoint      | Body       | Resposta  | Auth |
| ------ | ------------- | ---------- | --------- | ---- |
| GET    | `/boards`     | -          | `Board[]` | Sim  |
| GET    | `/boards/:id` | -          | `Board`   | Sim  |
| POST   | `/teams`      | `{ name }` | `Board`   | Sim  |
| DELETE | `/boards/:id` | -          | -         | Sim  |

**Estrutura Board:**

```typescript
{
  id: string
  name: string
  scrumMaster: string
  creatorEmail: string
  members: string[]
  createdAt: Date
}
```

### Cartões (Cards)

| Método | Endpoint       | Body                                      | Resposta    | Auth |
| ------ | -------------- | ----------------------------------------- | ----------- | ---- |
| GET    | `/entries/:id` | -                                         | `BoardData` | Sim  |
| POST   | `/entries`     | `{ title, description, column, boardId }` | `Card`      | Sim  |
| PATCH  | `/entries`     | `{ id, title?, description? }`            | `Card`      | Sim  |
| DELETE | `/entries`     | `{ id }`                                  | -           | Sim  |

**Estrutura BoardData:**

```typescript
{
  done: Card[]
  willDo: Card[]
  blockers: Card[]
}
```

**Estrutura Card:**

```typescript
{
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
}
```

### Equipe (Team)

| Método | Endpoint                           | Body | Resposta       | Auth |
| ------ | ---------------------------------- | ---- | -------------- | ---- |
| GET    | `/boards/:boardId/members`         | -    | `TeamMember[]` | Sim  |
| POST   | `/teams/:team_id/members/:user_id` | -    | `TeamMember`   | Sim  |
| DELETE | `/teams/:team_id/members/:user_id` | -    | -              | Sim  |

**Estrutura TeamMember:**

```typescript
{
  id: string;
  name: string;
  email: string;
  addedAt: Date;
}
```

### Analytics

| Método | Endpoint                                 | Body                     | Resposta             |
| ------ | ---------------------------------------- | ------------------------ | -------------------- |
| POST   | `/boards/:boardId/analytics/blockers`    | `{ startDate, endDate }` | `BlockerStats`       |
| POST   | `/boards/:boardId/analytics/performance` | `{ startDate, endDate }` | `PerformanceMetrics` |

**Estrutura BlockerStats:**

```typescript
{
  total: number;
  resolved: number;
  unresolved: number;
}
```

**Estrutura PerformanceMetrics:**

```typescript
{
  tasksPerDay: Array<{ date: Date; completed: number }>;
  blockerStats: BlockerStats;
  totalTasksCompleted: number;
  averageTasksPerDay: number;
}
```

## Autenticação

A aplicação usa autenticação baseada em token Bearer:

1. Após login/registro bem-sucedido, a API retorna um token
2. O token é armazenado no `localStorage` do navegador
3. **Todas as requisições (exceto `/auth/login` e `/auth/register`) incluem o header:** `Authorization: Bearer <token>`
4. Para obter informações do usuário autenticado, use o endpoint `GET /auth/login/me`

## Estrutura dos Arquivos

### API Client (`lib/api.ts`)

Contém todas as funções para comunicação com a API:

- `authApi`: Métodos de autenticação
- `boardsApi`: Gerenciamento de quadros
- `cardsApi`: Gerenciamento de cartões
- `teamApi`: Gerenciamento de membros da equipe
- `analyticsApi`: Métricas e analytics

### Context de Autenticação (`contexts/auth-context.tsx`)

Gerencia o estado global de autenticação:

- Armazena usuário logado e token
- Persiste dados no localStorage
- Redireciona para login quando não autenticado

### Páginas e Componentes

Todas as páginas e componentes foram atualizados para usar as funções da API ao invés de localStorage:

- `app/boards/page.tsx`: Lista e criação de quadros
- `components/team-page-client.tsx`: Gerenciamento de equipe
- Demais componentes usam dados vindos da API

## Tratamento de Erros

Todos os métodos da API incluem tratamento de erros:

```typescript
try {
  const data = await boardsApi.getBoards();
  // Usar dados
} catch (error) {
  console.error("Erro ao carregar quadros:", error);
  // Mostrar mensagem de erro ao usuário
}
```

## Desenvolvimento Local

1. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
2. Certifique-se de que sua API backend está rodando
3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
pnpm dev
```

4. Acesse `http://localhost:3000`

## CORS

Certifique-se de que sua API backend permite requisições do domínio do frontend:

```javascript
// Exemplo para Express.js
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

## Migrações

As seguintes mudanças foram feitas para migrar de mocks para API real:

1. ✅ Todas as funções mockadas em `lib/api.ts` foram substituídas por chamadas HTTP reais
2. ✅ Arquivo `.env.local` criado com `NEXT_PUBLIC_API_URL`
3. ✅ Arquivo `.env.example` criado como referência
4. ✅ `app/boards/page.tsx` atualizado para usar `boardsApi`
5. ✅ `components/team-page-client.tsx` atualizado para usar `teamApi`
6. ✅ Context de autenticação mantém localStorage apenas para persistência de token

## Tipos TypeScript

Todos os tipos estão definidos em `lib/types.ts` e são compartilhados entre frontend e chamadas API.

---

## Resumo das Rotas da API

### Autenticação (sem Bearer token)

- `POST /auth/login` - Login
- `POST /auth/register` - Registro

### Rotas Protegidas (requerem Bearer token)

- `GET /auth/login/me` - Obter informações do usuário autenticado
- `POST /teams` - Criar time/quadro
- `GET /entries/:id` - Buscar cartões de um quadro
- `POST /entries` - Criar cartão
- `DELETE /entries` - Deletar cartão (body: `{ id }`)
- `POST /teams/:team_id/members/:user_id` - Adicionar membro ao time
- `DELETE /teams/:team_id/members/:user_id` - Remover membro do time
