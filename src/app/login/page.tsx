"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mariaclara@onzemets.com");
  const [senha, setSenha] = useState("123456");
  const [errEmail, setErrEmail] = useState("");
  const [errSenha, setErrSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<"login" | "esqueci" | "enviado">("login");
  const [recEmail, setRecEmail] = useState("");
  const [errRec, setErrRec] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type = "") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  async function doLogin() {
    setErrEmail(""); setErrSenha("");
    if (!email) { setErrEmail("Digite um e-mail válido."); return; }
    if (!senha) { setErrSenha("Digite sua senha."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) { setErrEmail(data.error || "Erro ao fazer login."); return; }
      router.push("/dashboard");
    } catch {
      setErrEmail("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function doEsqueci() {
    setErrRec("");
    if (!recEmail) { setErrRec("Digite um e-mail válido."); return; }
    await fetch("/api/auth/recuperar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recEmail }),
    });
    setScreen("enviado");
  }

  return (
    <div className="auth-wrap">
      {/* ── LOGIN ── */}
      {screen === "login" && (
        <div className="auth-left">
          <div className="logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Olá,<br />bem-vindo(a) de volta!</div>
            <p className="auth-sub">Realize o login da sua conta para acessar o sistema de gestão da sua clínica.</p>
          </div>
          <div className="auth-form">
            <div className="field-wrap">
              <input className={`auth-input${errEmail ? " error" : ""}`} type="email" placeholder="E-mail"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doLogin()} />
              <span className="field-error">{errEmail}</span>
            </div>
            <div className="field-wrap">
              <input className={`auth-input${errSenha ? " error" : ""}`} type="password" placeholder="Senha"
                value={senha} onChange={e => setSenha(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doLogin()} />
              <span className="field-error">{errSenha}</span>
            </div>
            <div className="auth-row">
              <label className="check-label"><input type="checkbox" /> Lembrar minha conta</label>
              <button className="link-btn" onClick={() => setScreen("esqueci")}>Esqueci minha senha</button>
            </div>
            <button className="btn btn-lime" onClick={doLogin} disabled={loading}>
              {loading ? "Entrando…" : "Acessar"}
            </button>
          </div>
          <p className="auth-footer">Problemas com o acesso? <a onClick={() => showToast("Contato: suporte@onzemets.com.br")}>Clique aqui.</a></p>
        </div>
      )}

      {/* ── ESQUECI SENHA ── */}
      {screen === "esqueci" && (
        <div className="auth-left">
          <div className="logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Recuperar<br />senha de acesso</div>
            <p className="auth-sub">Digite o e-mail cadastrado no sistema para recuperar sua senha.</p>
          </div>
          <div className="auth-form">
            <div className="field-wrap">
              <input className="auth-input" type="email" placeholder="E-mail"
                value={recEmail} onChange={e => setRecEmail(e.target.value)} />
              <span className="field-error">{errRec}</span>
            </div>
            <button className="btn btn-lime" onClick={doEsqueci}>Enviar</button>
            <button className="link-btn" onClick={() => setScreen("login")}>← Voltar para o login</button>
          </div>
          <p className="auth-footer">Problemas com o acesso? <a onClick={() => showToast("Contato: suporte@onzemets.com.br")}>Clique aqui.</a></p>
        </div>
      )}

      {/* ── ENVIADO ── */}
      {screen === "enviado" && (
        <div className="auth-left">
          <div className="logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Pronto.</div>
            <p className="success-text" style={{ marginTop: 16 }}>
              Se o e-mail digitado estiver cadastrado no sistema, você receberá uma mensagem para recuperar sua senha.
            </p>
            <p className="success-text" style={{ marginTop: 14 }}>
              Se você ainda não recebeu o e-mail, verifique a caixa de Spam. Se o problema persistir, entre em contato com a equipe de suporte.
            </p>
            <button className="btn btn-lime" style={{ marginTop: 26 }} onClick={() => setScreen("login")}>
              Voltar para o login
            </button>
          </div>
          <p className="auth-footer">Problemas para fazer o acesso? <a>Clique aqui.</a></p>
        </div>
      )}

      <div className="auth-right" />

      {toast && (
        <div className={`toast show${toast.type ? " " + toast.type : ""}`}>{toast.msg}</div>
      )}
    </div>
  );
}
