import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session.userId)
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const supabase = createServerClient();
  const { data: user } = await supabase
    .from("usuarios")
    .select("id, nome, email, funcao, status")
    .eq("id", session.userId)
    .single();

  return NextResponse.json(user || { error: "Usuário não encontrado." });
}
