import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "E-mail obrigatório." }, { status: 400 });
  // TODO: integrar com serviço de e-mail (Resend, SendGrid, etc.)
  return NextResponse.json({ message: "Se o e-mail estiver cadastrado, você receberá as instruções." });
}
