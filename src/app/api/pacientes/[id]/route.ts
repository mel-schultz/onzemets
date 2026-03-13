import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";
import type { Paciente } from "@/types/database";

async function auth() { const s = await getSession(); return s.userId ? s : null; }

type Params = Promise<{ id: string }>;

export async function GET(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from("pacientes").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
  return NextResponse.json(data as Paciente);
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase.from("pacientes").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Paciente);
}

export async function DELETE(_: NextRequest, { params }: { params: Params }) {
  if (!await auth()) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from("pacientes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Paciente removido." });
}
