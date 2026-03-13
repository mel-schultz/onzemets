import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session.userId)
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const hoje = new Date().toISOString().split("T")[0];

  const [r1, r2, r3, r4] = await Promise.all([
    supabase.from("pacientes").select("*", { count: "exact", head: true }),
    supabase.from("pacientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("usuarios").select("*",  { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("consultas").select("*", { count: "exact", head: true }).eq("data", hoje),
  ]);

  return NextResponse.json({
    totalPacientes:  r1.count ?? 0,
    pacientesAtivos: r2.count ?? 0,
    totalUsuarios:   r3.count ?? 0,
    consultasHoje:   r4.count ?? 0,
  });
}
