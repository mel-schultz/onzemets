// src/lib/seed.ts
// Script de seed para popular o banco Supabase com dados de demonstração.
// Uso: npm run db:seed

// Carrega .env.local antes de qualquer outra coisa
// (o tsx não carrega variáveis de ambiente automaticamente como o Next.js)
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("🌱 Iniciando seed do banco Supabase...\n");

  // ── Usuários ──────────────────────────────────────────────
  const usuarios = [
    { nome: "Maria Clara Noman",     email: "mariaclara@onzemets.com", senha: "123456", funcao: "Médica Cardiologista",          status: "ativo" },
    { nome: "Ana Clara Lages",       email: "anaclara@onzemets.com",   senha: "123456", funcao: "Fisioterapeuta Cardiovascular", status: "ativo" },
    { nome: "Anne Oliveira",         email: "anne@onzemets.com",       senha: "123456", funcao: "Fisioterapeuta Cardiovascular", status: "ativo" },
    { nome: "Beatriz Felício",       email: "beatriz@onzemets.com",    senha: "123456", funcao: "Médica Cardiologista",          status: "ativo" },
    { nome: "Ana Flávia Ferreira",   email: "anaflaavia@onzemets.com", senha: "123456", funcao: "Fisioterapeuta Cardiovascular", status: "ativo" },
    { nome: "Raimundo Santos",       email: "raimundo@onzemets.com",   senha: "123456", funcao: "Fisioterapeuta Cardiovascular", status: "inativo" },
  ];

  const { data: usersInserted, error: uErr } = await supabase
    .from("usuarios")
    .insert(usuarios.map(({ senha, ...u }) => ({ ...u, senha_hash: bcrypt.hashSync(senha, 10) })))
    .select();

  if (uErr) { console.error("❌ Erro ao inserir usuários:", uErr.message); process.exit(1); }
  console.log(`✅ ${usersInserted?.length} usuários criados`);

  // ── Pacientes ─────────────────────────────────────────────
  const pacientes = [
    { nome: "André Luís Arruda Lucas",    data_nasc: "1957-03-15", cpf: "345.678.901-23", sexo: "Masculino", telefone: "31 99216-4558", cep: "30220-100", rua: "Rua Palmira",     numero: "380",  complemento: "Apartamento 204", bairro: "Serra",       cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-02-20", proxima_consulta: "2025-08-28", faltas: 0 },
    { nome: "Maria Silva Eustáquio",      data_nasc: "1984-09-28", cpf: "209.963.220-00", sexo: "Feminino",  telefone: "31 99136-4287", cep: "30140-071", rua: "Av. Afonso Pena", numero: "1000", complemento: "",               bairro: "Centro",      cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-02-18", proxima_consulta: "2025-08-25", faltas: 1 },
    { nome: "João Santos Dornelles",      data_nasc: "1965-11-05", cpf: "123.456.789-00", sexo: "Masculino", telefone: "31 98765-4321", cep: "30130-110", rua: "Rua dos Guajajaras", numero: "45", complemento: "",              bairro: "Funcionários",cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-02-15", proxima_consulta: "2025-08-22", faltas: 2 },
    { nome: "Marcos Oliveira",            data_nasc: "1972-07-20", cpf: "987.654.321-00", sexo: "Masculino", telefone: "31 97654-3210", cep: "30411-158", rua: "Rua Espírito Santo", numero: "220", complemento: "Sala 5",       bairro: "Lourdes",     cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-02-10", proxima_consulta: "2025-08-24", faltas: 0 },
    { nome: "Adriano Fonseca",            data_nasc: "1980-04-12", cpf: "456.789.012-34", sexo: "Masculino", telefone: "31 96543-2109", cep: "30575-180", rua: "Rua Dona Alzira",  numero: "78",  complemento: "",               bairro: "Buritis",     cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-02-05", proxima_consulta: "2025-08-22", faltas: 1 },
    { nome: "Joana Damasceno",            data_nasc: "1959-02-28", cpf: "567.890.123-45", sexo: "Feminino",  telefone: "31 95432-1098", cep: "30330-130", rua: "Av. Raja Gabaglia", numero: "3000",complemento: "",               bairro: "Luxemburgo",  cidade: "Belo Horizonte", estado: "MG", status: "inativo", ultima_consulta: "2025-02-01", proxima_consulta: null,          faltas: 3 },
    { nome: "Luiz Márcio Guimarães",      data_nasc: "1968-06-18", cpf: "678.901.234-56", sexo: "Masculino", telefone: "31 94321-0987", cep: "30180-103", rua: "Rua São Paulo",    numero: "900", complemento: "",               bairro: "Funcionários",cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-01-28", proxima_consulta: "2025-08-26", faltas: 0 },
    { nome: "Max Aurélio de Resende Costa", data_nasc: "1963-09-03", cpf: "789.012.345-67", sexo: "Masculino", telefone: "31 93210-9876", cep: "30260-070", rua: "Rua Itajubá",  numero: "55",  complemento: "",               bairro: "Funcionários",cidade: "Belo Horizonte", estado: "MG", status: "ativo",   ultima_consulta: "2025-01-25", proxima_consulta: "2025-08-27", faltas: 1 },
  ];

  const { data: pacsInserted, error: pErr } = await supabase.from("pacientes").insert(pacientes).select();
  if (pErr) { console.error("❌ Erro ao inserir pacientes:", pErr.message); process.exit(1); }
  console.log(`✅ ${pacsInserted?.length} pacientes criados`);

  const pIds = (pacsInserted || []).map(p => p.id);
  const uIds = (usersInserted || []).map(u => u.id);

  // ── Evoluções ─────────────────────────────────────────────
  const evolucoes = [
    { paciente_id: pIds[0], titulo: "Evolução 65", tipo: "clinica",      data: "2025-02-20", criado_por: uIds[0], texto: "1 X SEMANA - Fazer monitorizado com ECG. FC ainda ultrapassando 150bpm em carga intermediária. Aumentar dose do Selozok para 50mg BID (Total = 100mg/dia)." },
    { paciente_id: pIds[0], titulo: "Evolução 64", tipo: "clinica",      data: "2025-02-13", criado_por: uIds[0], texto: "Paciente evoluindo bem. FC controlada durante o exercício a 130bpm na carga máxima. Manter protocolo atual. Sem queixas." },
    { paciente_id: pIds[0], titulo: "Evolução 63", tipo: "reabilitacao", data: "2025-02-06", criado_por: uIds[1], texto: "Tolerância ao exercício melhorada. VO2 estimado: 18 ml/kg/min. Aumentar carga progressivamente na próxima sessão." },
    { paciente_id: pIds[1], titulo: "Evolução 12", tipo: "clinica",      data: "2025-02-18", criado_por: uIds[0], texto: "Paciente apresentando boa tolerância ao esforço. FC adequada. Sem queixas. Continuar protocolo." },
    { paciente_id: pIds[2], titulo: "Evolução 08", tipo: "clinica",      data: "2025-02-15", criado_por: uIds[0], texto: "Leve dispneia durante ergométrico em carga alta. Recomendado ajuste de carga. ECG sem alterações." },
  ];

  const { data: evosInserted, error: eErr } = await supabase.from("evolucoes").insert(evolucoes).select();
  if (eErr) { console.error("❌ Erro ao inserir evoluções:", eErr.message); process.exit(1); }
  console.log(`✅ ${evosInserted?.length} evoluções criadas`);

  // ── Consultas ─────────────────────────────────────────────
  function offsetISO(n: number) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  }

  const consultas = [
    { paciente_id: pIds[0], profissional_id: uIds[0], data: offsetISO(0), hora: "08:00", observacoes: "" },
    { paciente_id: pIds[1], profissional_id: uIds[0], data: offsetISO(0), hora: "08:50", observacoes: "" },
    { paciente_id: pIds[2], profissional_id: uIds[1], data: offsetISO(0), hora: "09:00", observacoes: "" },
    { paciente_id: pIds[3], profissional_id: uIds[2], data: offsetISO(0), hora: "09:50", observacoes: "" },
    { paciente_id: pIds[4], profissional_id: uIds[0], data: offsetISO(0), hora: "10:00", observacoes: "" },
    { paciente_id: pIds[5], profissional_id: uIds[1], data: offsetISO(0), hora: "10:50", observacoes: "" },
    { paciente_id: pIds[6], profissional_id: uIds[0], data: offsetISO(0), hora: "11:00", observacoes: "" },
    { paciente_id: pIds[7], profissional_id: uIds[2], data: offsetISO(0), hora: "11:50", observacoes: "" },
    { paciente_id: pIds[0], profissional_id: uIds[0], data: offsetISO(1), hora: "09:00", observacoes: "" },
    { paciente_id: pIds[1], profissional_id: uIds[2], data: offsetISO(2), hora: "10:00", observacoes: "" },
    { paciente_id: pIds[2], profissional_id: uIds[1], data: offsetISO(3), hora: "08:00", observacoes: "" },
    { paciente_id: pIds[3], profissional_id: uIds[0], data: offsetISO(4), hora: "09:50", observacoes: "" },
    { paciente_id: pIds[4], profissional_id: uIds[1], data: offsetISO(5), hora: "11:00", observacoes: "" },
  ];

  const { data: consInserted, error: cErr } = await supabase.from("consultas").insert(consultas).select();
  if (cErr) { console.error("❌ Erro ao inserir consultas:", cErr.message); process.exit(1); }
  console.log(`✅ ${consInserted?.length} consultas criadas`);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📧 Login: mariaclara@onzemets.com / 123456\n");
}

main().catch(e => { console.error(e); process.exit(1); });
