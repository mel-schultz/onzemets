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

### Instalar e rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:3000
```

### Popular o banco com dados de demonstração

```bash
npm run db:seed
```

**Credenciais de demo:**

| E-mail                    | Senha  | Função                        |
|---------------------------|--------|-------------------------------|
| mariaclara@onzemets.com   | 123456 | Médica Cardiologista          |
| anaclara@onzemets.com     | 123456 | Fisioterapeuta Cardiovascular |
| anne@onzemets.com         | 123456 | Fisioterapeuta Cardiovascular |

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
