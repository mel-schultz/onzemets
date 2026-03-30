import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Evolucao } from "@/types/database";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

type Params = Promise<{ id: string }>;

export async function GET(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("evolucoes")
    .select("*, usuarios(nome)")
    .eq("paciente_id", id)
    .order("data", { ascending: false })
    .order("id", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = ((data ?? []) as (Evolucao & { usuarios: { nome: string } | null })[]).map((e) => {
    const { usuarios, ...rest } = e;
    return { ...rest, criado_por_nome: usuarios?.nome ?? null };
  });
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { 
    titulo, 
    texto, 
    tipo, 
    data,
    medico_responsavel,
    fisioterapeuta_responsavel,
    pas_inicial,
    pad_inicial,
    fc_inicial,
    peso,
    pas_pico,
    pad_pico,
    fc_pico,
    borg_maximo,
    distancia,
    pas_5min_recuperacao,
    pad_5min_recuperacao,
    tempo_total_aerobico,
    pas_repouso,
    pad_repouso,
    fc_media,
    descricao_treino_aerobico,
    tempo_total_muscular,
    descricao_treino_muscular,
    obs_clinicas,
    pas_final,
    pad_final,
    fc_final
  } = body;

  if (!titulo || !texto) return NextResponse.json({ error: "Título e texto obrigatórios." }, { status: 400 });
  
  const supabase = createServerClient();
  
  // Inserir evolução principal
  const { data: row, error } = await supabase
    .from("evolucoes")
    .insert({
      paciente_id: Number(id),
      titulo, 
      texto,
      tipo: tipo || "clinica",
      data: data || new Date().toISOString().split("T")[0],
      criado_por: session.userId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Se for evolução clínica, salvar os dados detalhados
  if (tipo === "clinica" && row) {
    const { error: clinicaError } = await supabase
      .from("evolucoes_clinicas")
      .insert({
        evolucao_id: row.id,
        paciente_id: Number(id),
        medico_responsavel: medico_responsavel || null,
        fisioterapeuta_responsavel: fisioterapeuta_responsavel || null,
        pas_inicial: pas_inicial ? Number(pas_inicial) : null,
        pad_inicial: pad_inicial ? Number(pad_inicial) : null,
        fc_inicial: fc_inicial ? Number(fc_inicial) : null,
        peso: peso ? Number(peso) : null,
        pas_pico: pas_pico ? Number(pas_pico) : null,
        pad_pico: pad_pico ? Number(pad_pico) : null,
        fc_pico: fc_pico ? Number(fc_pico) : null,
        borg_maximo: borg_maximo ? Number(borg_maximo) : null,
        distancia: distancia ? Number(distancia) : null,
        pas_5min_recuperacao: pas_5min_recuperacao ? Number(pas_5min_recuperacao) : null,
        pad_5min_recuperacao: pad_5min_recuperacao ? Number(pad_5min_recuperacao) : null,
        tempo_total_aerobico: tempo_total_aerobico ? Number(tempo_total_aerobico) : null,
        pas_repouso: pas_repouso ? Number(pas_repouso) : null,
        pad_repouso: pad_repouso ? Number(pad_repouso) : null,
        fc_media: fc_media ? Number(fc_media) : null,
        descricao_treino_aerobico: descricao_treino_aerobico || null,
        tempo_total_muscular: tempo_total_muscular ? Number(tempo_total_muscular) : null,
        descricao_treino_muscular: descricao_treino_muscular || null,
        obs_clinicas: obs_clinicas || null,
        pas_final: pas_final ? Number(pas_final) : null,
        pad_final: pad_final ? Number(pad_final) : null,
        fc_final: fc_final ? Number(fc_final) : null,
      });

    if (clinicaError) {
      console.error("Erro ao salvar evolução clínica detalhada:", clinicaError);
    }
  }

  return NextResponse.json(row as Evolucao, { status: 201 });
}
