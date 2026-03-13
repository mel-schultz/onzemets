import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() {
  const session = await getSession();
  if (!session.userId) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q");
  const status = searchParams.get("status");

  let query = supabase.from("pacientes").select("*").order("nome");
  if (q)      query = query.ilike("nome", `%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json();
  if (!body.nome) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase.from("pacientes").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
