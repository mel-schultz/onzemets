"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<"login"|"esqueci"|"enviado">("login");
  const [email, setEmail]   = useState("mel.schultz@yahoo.com");
  const [senha, setSenha]   = useState("123456");
  const [errEmail, setErrEmail] = useState("");
  const [errSenha, setErrSenha] = useState("");
  const [loading, setLoading]   = useState(false);
  const [recEmail, setRecEmail] = useState("");
  const [errRec, setErrRec]     = useState("");
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);

  function showToast(msg: string, type = "") {
    setToast({msg,type}); setTimeout(()=>setToast(null),3200);
  }

  async function doLogin() {
    setErrEmail(""); setErrSenha("");
    if (!email) { setErrEmail("Digite um e-mail válido."); return; }
    if (!senha) { setErrSenha("Digite sua senha."); return; }
    setLoading(true);
    try {
      console.log("[frontend] Enviando requisição de login...");
      const res = await fetch("/api/auth/login", {
        method:"POST", 
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email,senha}),
      });
      
      console.log("[frontend] Status da resposta:", res.status);
      const data = await res.json();
      console.log("[frontend] Resposta recebida:", data);
      
      if (!res.ok) { 
        setErrEmail(data.error || "Credenciais incorretas."); 
        console.error("[frontend] Erro de login:", data.error);
        return; 
      }
      
      console.log("[frontend] Login bem-sucedido, redirecionando...");
      router.push("/dashboard");
    } catch (err) { 
      console.error("[frontend] Erro de conexão:", err);
      setErrEmail("Erro de conexão. Verifique sua internet e tente novamente."); 
    }
    finally { setLoading(false); }
  }

  async function doEsqueci() {
    setErrRec("");
    if (!recEmail) { setErrRec("Digite um e-mail válido."); return; }
    await fetch("/api/auth/recuperar-senha",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:recEmail})});
    setScreen("enviado");
  }

  return (
    <div className="auth-wrap">
      {/* LEFT */}
      {screen === "login" && (
        <div className="auth-left">
          <div className="auth-logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Olá,<br/>bem-vindo(a) de volta!</div>
            <p className="auth-sub">Realize o login da sua conta para acessar o sistema de gestão da sua clínica.</p>
          </div>
          <div className="auth-form">
            <div className="auth-field">
              <input
                className={`auth-input${errEmail?" error":""}`}
                type="email" placeholder="E-mail"
                value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&doLogin()}
              />
              {errEmail && <span className="field-err">{errEmail}</span>}
            </div>
            <div className="auth-field">
              <input
                className={`auth-input${errSenha?" error":""}`}
                type="password" placeholder="Senha"
                value={senha} onChange={e=>setSenha(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&doLogin()}
              />
              {errSenha && <span className="field-err">{errSenha}</span>}
            </div>
            <div className="auth-row">
              <label className="check-label">
                <input type="checkbox"/> Lembrar minha conta
              </label>
              <button className="link-btn" onClick={()=>setScreen("esqueci")}>
                Esqueci minha senha
              </button>
            </div>
            <button className="btn-lime-lg" onClick={doLogin} disabled={loading}
              style={{border:"none",cursor:"pointer",fontFamily:"var(--font)",fontWeight:600}}>
              {loading ? "Entrando…" : "Acessar"}
            </button>
          </div>
          <p className="auth-footer">
            Problemas com o acesso? <a onClick={()=>showToast("Contato: suporte@onzemets.com.br")}>Clique aqui.</a>
          </p>
        </div>
      )}

      {screen === "esqueci" && (
        <div className="auth-left">
          <div className="auth-logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Recuperar<br/>senha de acesso</div>
            <p className="auth-sub">Digite o e-mail cadastrado no sistema para recuperar sua senha.</p>
          </div>
          <div className="auth-form">
            <div className="auth-field">
              <input className="auth-input" type="email" placeholder="E-mail"
                value={recEmail} onChange={e=>setRecEmail(e.target.value)}/>
              {errRec && <span className="field-err">{errRec}</span>}
            </div>
            <button className="btn-lime-lg" onClick={doEsqueci}
              style={{border:"none",cursor:"pointer",fontFamily:"var(--font)",fontWeight:600}}>
              Enviar
            </button>
            <button className="link-btn" onClick={()=>setScreen("login")}>← Voltar para o login</button>
          </div>
          <p className="auth-footer">Problemas com o acesso? <a>Clique aqui.</a></p>
        </div>
      )}

      {screen === "enviado" && (
        <div className="auth-left">
          <div className="auth-logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
          <div>
            <div className="auth-heading">Pronto.</div>
            <p className="success-msg" style={{marginTop:16}}>
              Se o e-mail digitado estiver cadastrado no sistema, você receberá uma mensagem para recuperar sua senha.
            </p>
            <p className="success-msg" style={{marginTop:14}}>
              Se você ainda não recebeu o e-mail, verifique a caixa de Spam. Se o problema persistir, entre em contato com a equipe de suporte aqui.
            </p>
            <button className="btn-lime-lg" style={{marginTop:26,border:"none",cursor:"pointer",fontFamily:"var(--font)",fontWeight:600}}
              onClick={()=>setScreen("login")}>
              Voltar para o login
            </button>
          </div>
          <p className="auth-footer">Problemas para fazer o acesso? <a>Clique aqui.</a></p>
        </div>
      )}

      <div className="auth-right"/>

      {toast && (
        <div className={`toast show${toast.type?" "+toast.type:""}`}>{toast.msg}</div>
      )}
    </div>
  );
}
