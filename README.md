# OnzeMETs — Next.js + Supabase

Sistema de Gestão de Clínica de Reabilitação Cardíaca, migrado de Express/SQLite para **Next.js 14 + Supabase**, pronto para deploy na **Vercel**.

---

## Stack

| Camada     | Tecnologia                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 App Router + React 18    |
| Backend    | Next.js API Routes (mesmo servidor) |
| Banco      | Supabase (PostgreSQL)               |
| Sessão     | iron-session (cookies criptografados)|
| Auth hash  | bcryptjs                            |
| Deploy     | Vercel                              |

---

## Configuração em 5 passos

### 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Guarde a **URL** e as **chaves API** (Settings → API)
3. Vá em **SQL Editor → New Query**, cole o conteúdo de `supabase-schema.sql` e execute

### 2. Variáveis de ambiente

```bash
# Copie o template
cp .env.example .env.local
```

Edite `.env.local` com seus valores reais:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Gere uma string segura:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=sua-string-de-64-chars-aqui
```

### 3. Instalar e rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

### 4. Popular o banco com dados de demonstração

```bash
npm run db:seed
```

**Credenciais de demo:**

| E-mail                    | Senha  | Função                        |
|---------------------------|--------|-------------------------------|
| mariaclara@onzemets.com   | 123456 | Médica Cardiologista          |
| anaclara@onzemets.com     | 123456 | Fisioterapeuta Cardiovascular |
| anne@onzemets.com         | 123456 | Fisioterapeuta Cardiovascular |

### 5. Deploy na Vercel

#### Opção A — Interface Web (mais simples)

1. Faça push do projeto para um repositório GitHub/GitLab
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
3. Em **Settings → Environment Variables**, adicione cada variável:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
4. Clique em **Deploy**

#### Opção B — Vercel CLI (recomendado para equipes)

```bash
# Instalar CLI
npm i -g vercel

# Login e vincular projeto
vercel login
vercel link

# Adicionar variáveis (uma por vez, escolha Production/Preview/Development)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SESSION_SECRET

# Sincronizar .env.local com as variáveis da Vercel
vercel env pull .env.local

# Deploy em produção
vercel --prod
```

#### Opção C — Integração direta Supabase × Vercel

No Supabase Dashboard → **Project Settings → Integrations → Vercel**:
conecte seu projeto e as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` são adicionadas automaticamente.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx                    # Layout raiz
│   ├── page.tsx                      # Redireciona → /dashboard ou /login
│   ├── globals.css                   # Design system OnzeMETs
│   ├── login/page.tsx                # Tela de autenticação
│   ├── (app)/                        # Área protegida
│   │   ├── layout.tsx                # Sidebar + Topbar
│   │   ├── dashboard/page.tsx
│   │   ├── pacientes/
│   │   │   ├── page.tsx              # Lista de pacientes
│   │   │   └── [id]/page.tsx         # Perfil do paciente + evoluções
│   │   ├── consultas/page.tsx        # Grade semanal
│   │   └── usuarios/page.tsx         # Equipe
│   └── api/
│       ├── auth/{login,logout,me,recuperar-senha}/route.ts
│       ├── dashboard/stats/route.ts
│       ├── pacientes/route.ts
│       ├── pacientes/[id]/route.ts
│       ├── pacientes/[id]/evolucoes/route.ts
│       ├── pacientes/[id]/evolucoes/[eid]/route.ts
│       ├── consultas/route.ts
│       ├── consultas/hoje/route.ts
│       ├── consultas/[id]/route.ts
│       ├── usuarios/route.ts
│       └── usuarios/[id]/route.ts
├── lib/
│   ├── supabase.ts    # Clientes anon (browser) e service role (server)
│   ├── session.ts     # iron-session config + helpers
│   └── seed.ts        # Script de seed (npm run db:seed)
├── middleware.ts       # Proteção global de rotas
└── types/
    └── database.ts    # Tipos TypeScript das tabelas
```

---

## Regras de segurança das variáveis

| Variável                      | Prefixo `NEXT_PUBLIC_` | Exposta ao browser | Uso |
|-------------------------------|------------------------|--------------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL`    | ✅ sim                 | ✅ sim             | URL pública do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ sim              | ✅ sim             | Chave pública (RLS desabilitado: não usar no client) |
| `SUPABASE_SERVICE_ROLE_KEY`   | ❌ não                 | ❌ nunca           | Apenas API Routes — bypassa RLS |
| `SESSION_SECRET`              | ❌ não                 | ❌ nunca           | Assinatura dos cookies de sessão |

> ⚠️ Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou `SESSION_SECRET` no browser.

---

## API REST (mesmas rotas do projeto original)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET  | /api/auth/me | Usuário da sessão |
| GET  | /api/dashboard/stats | Estatísticas |
| GET/POST | /api/pacientes | Lista / Cadastrar |
| GET/PUT/DELETE | /api/pacientes/:id | Detalhe / Editar / Remover |
| GET/POST | /api/pacientes/:id/evolucoes | Lista / Nova evolução |
| PUT/DELETE | /api/pacientes/:id/evolucoes/:eid | Editar / Remover evolução |
| GET/POST | /api/consultas | Lista com filtros / Agendar |
| GET  | /api/consultas/hoje | Consultas do dia |
| PUT/DELETE | /api/consultas/:id | Editar / Cancelar |
| GET/POST | /api/usuarios | Lista / Cadastrar |
| GET/PUT/DELETE | /api/usuarios/:id | Detalhe / Editar / Remover |
