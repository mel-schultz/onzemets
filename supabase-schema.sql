-- ══════════════════════════════════════════════════════════════
-- OnzeMETs — Schema SQL para Supabase (PostgreSQL)
-- Cole no SQL Editor: Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════

-- ── Usuários ──────────────────────────────────────────────────
create table if not exists usuarios (
  id          bigint primary key generated always as identity,
  nome        text not null,
  email       text not null unique,
  senha_hash  text not null,
  funcao      text not null,
  status      text not null default 'ativo' check (status in ('ativo', 'inativo')),
  criado_em   timestamptz not null default now()
);

-- ── Pacientes ─────────────────────────────────────────────────
create table if not exists pacientes (
  id               bigint primary key generated always as identity,
  nome             text not null,
  data_nasc        date,
  cpf              text,
  sexo             text,
  telefone         text,
  telefone2        text,
  email            text,
  cep              text,
  rua              text,
  numero           text,
  complemento      text,
  bairro           text,
  cidade           text,
  estado           text,
  status           text not null default 'ativo' check (status in ('ativo', 'inativo')),
  ultima_consulta  date,
  proxima_consulta date,
  faltas           integer not null default 0,
  criado_em        timestamptz not null default now()
);

-- ── Consultas ─────────────────────────────────────────────────
create table if not exists consultas (
  id               bigint primary key generated always as identity,
  paciente_id      bigint not null references pacientes(id) on delete cascade,
  profissional_id  bigint not null references usuarios(id),
  data             date not null,
  hora             text not null,
  observacoes      text,
  criado_em        timestamptz not null default now()
);

create index if not exists idx_consultas_data on consultas(data);
create index if not exists idx_consultas_paciente on consultas(paciente_id);

-- ── Evoluções ─────────────────────────────────────────────────
create table if not exists evolucoes (
  id          bigint primary key generated always as identity,
  paciente_id bigint not null references pacientes(id) on delete cascade,
  titulo      text not null,
  texto       text not null,
  tipo        text not null default 'clinica' check (tipo in ('clinica', 'reabilitacao', 'avaliacao', 'historico')),
  data        date not null,
  criado_por  bigint references usuarios(id),
  criado_em   timestamptz not null default now()
);

create index if not exists idx_evolucoes_paciente on evolucoes(paciente_id);

-- ── Evolução Clínica (Detalhes) ────────────────────────────────
create table if not exists evolucoes_clinicas (
  id                              bigint primary key generated always as identity,
  evolucao_id                     bigint not null references evolucoes(id) on delete cascade,
  paciente_id                     bigint not null references pacientes(id) on delete cascade,
  medico_responsavel              text,
  fisioterapeuta_responsavel      text,
  pas_inicial                     numeric,
  pad_inicial                     numeric,
  fc_inicial                      numeric,
  peso                            numeric,
  pas_pico                        numeric,
  pad_pico                        numeric,
  fc_pico                         numeric,
  borg_maximo                     numeric,
  distancia                       numeric,
  pas_5min_recuperacao            numeric,
  pad_5min_recuperacao            numeric,
  tempo_total_aerobico            numeric,
  pas_repouso                     numeric,
  pad_repouso                     numeric,
  fc_media                        numeric,
  descricao_treino_aerobico       text,
  tempo_total_muscular            numeric,
  descricao_treino_muscular       text,
  obs_clinicas                    text,
  pas_final                       numeric,
  pad_final                       numeric,
  fc_final                        numeric,
  criado_em                       timestamptz not null default now()
);

create index if not exists idx_evolucoes_clinicas_evolucao on evolucoes_clinicas(evolucao_id);
create index if not exists idx_evolucoes_clinicas_paciente on evolucoes_clinicas(paciente_id);

-- ── RLS (Row Level Security) ──────────────────────────────────
-- Desabilitado: o acesso é controlado pela service_role key no servidor.
-- Para habilitar RLS futuramente com autenticação Supabase nativa,
-- crie policies específicas por usuário.
alter table usuarios  disable row level security;
alter table pacientes disable row level security;
alter table consultas disable row level security;
alter table evolucoes disable row level security;
alter table evolucoes_clinicas disable row level security;
