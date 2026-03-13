import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { data: rows, error } = await supabase
    .from("consultas")
    .select("*, pacientes(nome), usuarios(nome)")
    .eq("data", hoje)
    .order("hora");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (rows || []).map((c: Record<string, unknown>) => {
    const pac  = c.pacientes as { nome: string } | null;
    const prof = c.usuarios  as { nome: string } | null;
    const { pacientes: _p, usuarios: _u, ...rest } = c;
    return { ...rest, paciente_nome: pac?.nome ?? "", profissional_nome: prof?.nome ?? "" };
  });

  return NextResponse.json(mapped);
}
