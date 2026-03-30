// src/types/database.ts
// Tipos espelhando as tabelas do Supabase.

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, "id" | "criado_em">;
        Update: Partial<Omit<Usuario, "id" | "criado_em">>;
      };
      pacientes: {
        Row: Paciente;
        Insert: Omit<Paciente, "id" | "criado_em">;
        Update: Partial<Omit<Paciente, "id" | "criado_em">>;
      };
      consultas: {
        Row: Consulta;
        Insert: Omit<Consulta, "id" | "criado_em">;
        Update: Partial<Omit<Consulta, "id" | "criado_em">>;
      };
      evolucoes: {
        Row: Evolucao;
        Insert: Omit<Evolucao, "id" | "criado_em">;
        Update: Partial<Omit<Evolucao, "id" | "criado_em">>;
      };
    };
  };
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  funcao: string; // Armazena múltiplos papéis separados por vírgula
  status: "ativo" | "inativo";
  criado_em: string;
}

export const FUNCOES_DISPONIVEIS = [
  "Super Admin",
  "Administrador",
  "Médica Cardiologista",
  "Fisioterapeuta Cardiovascular",
  "Secretária"
] as const;

export const CORES_FUNCOES: Record<string, string> = {
  "Super Admin": "#7c3aed", // Roxo
  "Administrador": "#2563eb", // Azul
  "Médica Cardiologista": "#e11d48", // Rosa/Vermelho
  "Fisioterapeuta Cardiovascular": "#059669", // Verde
  "Secretária": "#d97706" // Laranja
};

export interface Paciente {
  id: number;
  nome: string;
  data_nasc: string | null;
  cpf: string | null;
  sexo: string | null;
  telefone: string | null;
  telefone2: string | null;
  email: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  status: "ativo" | "inativo";
  ultima_consulta: string | null;
  proxima_consulta: string | null;
  faltas: number;
  criado_em: string;
}

export interface Consulta {
  id: number;
  paciente_id: number;
  profissional_id: number;
  data: string;
  hora: string;
  observacoes: string | null;
  criado_em: string;
}

export interface ConsultaComNomes extends Consulta {
  paciente_nome: string;
  profissional_nome: string;
  profissional_funcao: string;
}

export interface Evolucao {
  id: number;
  paciente_id: number;
  titulo: string;
  texto: string;
  tipo: "clinica" | "reabilitacao";
  data: string;
  criado_por: number | null;
  criado_em: string;
}

export interface EvolucaoComAutor extends Evolucao {
  criado_por_nome: string | null;
}
