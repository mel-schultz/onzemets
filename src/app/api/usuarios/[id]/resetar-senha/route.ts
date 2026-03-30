import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase";

async function auth() {
  const s = await getSession();
  return s.userId ? s : null;
}

function isSuper(funcao: string) {
  return funcao.split(",").map(r => r.trim()).includes("Super Admin");
}

type Params = Promise<{ id: string }>;

export async function POST(_: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // Apenas Super Admin pode resetar senha de outros usuários
  if (!isSuper(session.userFuncao || "")) {
    return NextResponse.json({ error: "Apenas Super Admin pode resetar senhas." }, { status: 403 });
  }

  const { id } = await params;

  // Não permitir resetar a própria senha por esta rota
  if (Number(id) === session.userId) {
    return NextResponse.json({ error: "Use a rota de edição de perfil para alterar sua própria senha." }, { status: 400 });
  }

  const supabase = createServerClient();

  // Buscar o usuário para confirmar que existe
  const { data: usuario, error: userError } = await supabase
    .from("usuarios")
    .select("id, email, nome")
    .eq("id", id)
    .single();

  if (userError || !usuario) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // TODO: Integrar com serviço de e-mail (Resend, SendGrid, etc.)
  // Por enquanto, apenas retornamos sucesso e a senha padrão será '123456'
  // Em produção, você deveria:
  // 1. Gerar um token de reset único
  // 2. Enviar e-mail com link de reset
  // 3. Armazenar o token no banco com expiração

  return NextResponse.json({
    message: `E-mail de recuperação de senha será enviado para ${usuario.email}`,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    },
    nota: "Integração com serviço de e-mail pendente. Senha temporária: 123456"
  });
}
