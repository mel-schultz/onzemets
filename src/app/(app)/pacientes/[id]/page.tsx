"use client";
import{useEffect,useState,useCallback}from"react";
import{useRouter,useParams}from"next/navigation";
interface Pac{id:number;nome:string;sexo:string|null;data_nasc:string|null;ultima_consulta:string|null;proxima_consulta:string|null;faltas:number;cpf:string|null;telefone:string|null;telefone2:string|null;email:string|null;cep:string|null;rua:string|null;numero:string|null;complemento:string|null;bairro:string|null;cidade:string|null;estado:string|null;}
interface Evo{id:number;titulo:string;texto:string;tipo:string;data:string;criado_por_nome:string|null;}
function fmt(iso:string|null){if(!iso)return"—";const[y,m,d]=iso.split("-");return`${d}/${m}/${y}`;}
function age(n:string|null){if(!n)return"?";const b=new Date(n),t=new Date();let a=t.getFullYear()-b.getFullYear();if(t<new Date(t.getFullYear(),b.getMonth(),b.getDate()))a--;return a;}
function today(){return new Date().toISOString().split("T")[0];}

export default function PatientDetailPage(){
  const router=useRouter();
  const{id}=useParams<{id:string}>();
  const[pac,setPac]=useState<Pac|null>(null);
  const[evos,setEvos]=useState<Evo[]>([]);
  const[tab,setTab]=useState<"perfil"|"dados"|"evolucoes">("perfil");
  const[modalEvo,setModalEvo]=useState(false);
  const[editEvoId,setEditEvoId]=useState<number|null>(null);
  const[evoForm,setEvoForm]=useState({titulo:"",texto:"",tipo:"clinica",data:today()});
  const[toast,setToast]=useState<{msg:string;type:string}|null>(null);
  function showToast(msg:string,type=""){setToast({msg,type});setTimeout(()=>setToast(null),3200);}

  const load=useCallback(async()=>{
    const[p,e]=await Promise.all([
      fetch(`/api/pacientes/${id}`).then(r=>r.json()),
      fetch(`/api/pacientes/${id}/evolucoes`).then(r=>r.json()),
    ]);
    if(p.error){router.push("/pacientes");return;}
    setPac(p);setEvos(Array.isArray(e)?e:[]);
  },[id,router]);
  useEffect(()=>{load();},[load]);

  async function saveEvo(){
    if(!evoForm.titulo||!evoForm.texto){showToast("Preencha título e texto","error");return;}
    const url=editEvoId?`/api/pacientes/${id}/evolucoes/${editEvoId}`:`/api/pacientes/${id}/evolucoes`;
    const res=await fetch(url,{method:editEvoId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(evoForm)});
    if(!res.ok){const d=await res.json();showToast(d.error||"Erro","error");return;}
    setModalEvo(false);showToast("Evolução salva!","success");load();
  }
  async function delEvo(eid:number){
    if(!confirm("Remover esta evolução?"))return;
    await fetch(`/api/pacientes/${id}/evolucoes/${eid}`,{method:"DELETE"});
    showToast("Evolução removida.","success");load();
  }

  if(!pac)return<div className="loading"><span className="spinner"/>Carregando...</div>;

  const clinicas=evos.filter(e=>e.tipo==="clinica");
  const reab=evos.filter(e=>e.tipo!=="clinica");
  const dados=[
    ["Nome do paciente",pac.nome],["Data de nascimento",fmt(pac.data_nasc)],
    ["CPF",pac.cpf||"—"],["Telefone",pac.telefone||"—"],
    ["Telefone alternativo",pac.telefone2||"—"],["E-mail",pac.email||"—"],
    ["Rua",pac.rua||"—"],["Número",pac.numero||"—"],
    ["Complemento",pac.complemento||"—"],["CEP",pac.cep||"—"],
    ["Bairro",pac.bairro||"—"],["Cidade",pac.cidade||"—"],["Estado",pac.estado||"—"],
  ];

  return(
    <div>
      {/* PATIENT BAR */}
      <div className="patient-bar">
        <button className="btn btn-outline btn-sm" onClick={()=>router.push("/pacientes")}>← Voltar</button>
        <div className="patient-name">
          <span style={{fontSize:22}}>👤</span>
          {pac.nome}
        </div>
        <div className="ptags">
          <div className="ptag">{pac.sexo==="Masculino"?"♂":"♀"} {pac.sexo||"—"}</div>
          <div className="ptag">🎂 {age(pac.data_nasc)} anos</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {(["perfil","dados","evolucoes"] as const).map(t=>(
            <button key={t} className={`btn btn-sm${tab===t?" btn-lime":" btn-outline"}`} onClick={()=>setTab(t)}>
              {t==="perfil"?"Perfil":t==="dados"?"Dados":tab==="evolucoes"?"Evoluções ✓":"Evoluções"}
            </button>
          ))}
        </div>
      </div>

      {/* TAB PERFIL */}
      {tab==="perfil"&&(
        <>
          <div className="detail-stats">
            {[
              {label:"Última consulta",icon:"📅",value:fmt(pac.ultima_consulta)},
              {label:"Próxima consulta",icon:"📅",value:fmt(pac.proxima_consulta)},
              {label:"Faltas",icon:"❌",value:String(pac.faltas||0).padStart(2,"0")},
            ].map(s=>(
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{fontSize:22}}>{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{fontSize:28}}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="detail-grid">
            {/* Atualizações clínicas */}
            <div className="pcard">
              <div className="pcard-head">
                <div className="pcard-title">📋 Atualizações clínicas</div>
              </div>
              <div className="pcard-divider"/>
              {clinicas.length>0?(
                <>
                  <div className="pcard-date">{fmt(clinicas[0].data)}</div>
                  <div className="pcard-text">{clinicas[0].texto}</div>
                </>
              ):(
                <div className="pcard-text">Nenhuma atualização clínica.</div>
              )}
              <div className="pcard-actions">
                <button className="btn btn-outline btn-sm" onClick={()=>setTab("evolucoes")}>📄 Ver atualizações</button>
                <button className="btn btn-outline btn-sm" onClick={()=>{setEditEvoId(null);setEvoForm({titulo:"",texto:"",tipo:"clinica",data:today()});setModalEvo(true);}}>✏️ Editar</button>
              </div>
            </div>
            {/* Evolução da Reabilitação */}
            <div className="pcard">
              <div className="pcard-head">
                <div className="pcard-title">🏃 Evolução da Reabilitação</div>
              </div>
              <div className="pcard-divider"/>
              {reab.length>0?(
                <>
                  <div className="pcard-num">{reab[0].titulo}</div>
                  <div className="pcard-divider" style={{margin:"8px 0"}}/>
                  <div className="pcard-text">{reab[0].texto}</div>
                </>
              ):(
                <div className="pcard-text">Nenhuma evolução de reabilitação.</div>
              )}
              <div className="pcard-actions">
                <button className="btn btn-outline btn-sm" onClick={()=>setTab("evolucoes")}>📄 Ver evolução</button>
                <button className="btn btn-outline btn-sm" onClick={()=>{setEditEvoId(null);setEvoForm({titulo:"",texto:"",tipo:"reabilitacao",data:today()});setModalEvo(true);}}>✏️ Editar</button>
              </div>
            </div>
            {/* Avaliação física */}
            <div className="pcard">
              <div className="pcard-head"><div className="pcard-title">🏋️ Avaliação física</div></div>
              <div className="pcard-divider"/>
              <div className="pcard-text" style={{color:"var(--gray)"}}>Nenhuma avaliação física registrada.</div>
              <div className="pcard-actions">
                <button className="btn btn-outline btn-sm">📄 Ver avaliação</button>
                <button className="btn btn-outline btn-sm">✏️ Editar</button>
              </div>
            </div>
            {/* Histórico clínico */}
            <div className="pcard">
              <div className="pcard-head"><div className="pcard-title">📁 Histórico clínico</div></div>
              <div className="pcard-divider"/>
              {clinicas.length>1?(
                <div className="pcard-text">{clinicas[1].texto}</div>
              ):(
                <div className="pcard-text" style={{color:"var(--gray)"}}>Nenhum histórico adicional.</div>
              )}
              <div className="pcard-actions">
                <button className="btn btn-outline btn-sm" onClick={()=>setTab("evolucoes")}>📄 Ver histórico</button>
                <button className="btn btn-outline btn-sm">✏️ Editar</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB DADOS */}
      {tab==="dados"&&(
        <div className="card">
          <div className="dados-table">
            {dados.map(([l,v])=>(
              <div key={l} className="data-row">
                <div className="data-label">{l}</div>
                <div className="data-val">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB EVOLUÇÕES */}
      {tab==="evolucoes"&&(
        <div className="card">
          <div className="page-header">
            <div className="page-title">Evoluções</div>
            <button className="btn btn-lime btn-sm" onClick={()=>{setEditEvoId(null);setEvoForm({titulo:"",texto:"",tipo:"clinica",data:today()});setModalEvo(true);}}>
              + Nova Evolução
            </button>
          </div>
          <div className="evo-list">
            {evos.length===0
              ?<p style={{color:"var(--gray)",fontSize:14}}>Nenhuma evolução registrada.</p>
              :evos.map(e=>(
                <div key={e.id} className="evo-card">
                  <div className="evo-header">
                    <span className="evo-num">{e.titulo}<span className="evo-date">{fmt(e.data)}</span></span>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>{setEditEvoId(e.id);setEvoForm({titulo:e.titulo,texto:e.texto,tipo:e.tipo,data:e.data});setModalEvo(true);}}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>delEvo(e.id)}>🗑</button>
                    </div>
                  </div>
                  <div className="evo-txt">{e.texto}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL EVOLUÇÃO */}
      {modalEvo&&(
        <div className="modal-overlay open" onClick={e=>e.target===e.currentTarget&&setModalEvo(false)}>
          <div className="modal">
            <button className="modal-close" onClick={()=>setModalEvo(false)}>✕</button>
            <div className="modal-title">{editEvoId?"Editar Evolução":"Nova Evolução"}</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" value={evoForm.titulo} onChange={e=>setEvoForm(f=>({...f,titulo:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={evoForm.tipo} onChange={e=>setEvoForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="clinica">Clínica</option>
                  <option value="reabilitacao">Reabilitação</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input className="form-input" type="date" value={evoForm.data} onChange={e=>setEvoForm(f=>({...f,data:e.target.value}))}/>
              </div>
              <div className="form-group form-full">
                <label className="form-label">Texto *</label>
                <textarea className="form-textarea" rows={6} value={evoForm.texto} onChange={e=>setEvoForm(f=>({...f,texto:e.target.value}))}/>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={()=>setModalEvo(false)}>Cancelar</button>
              <button className="btn btn-lime" onClick={saveEvo}>Salvar</button>
            </div>
          </div>
        </div>
      )}
      {toast&&<div className={`toast show${toast.type?" "+toast.type:""}`}>{toast.msg}</div>}
    </div>
  );
}
