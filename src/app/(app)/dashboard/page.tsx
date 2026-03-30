"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CORES_FUNCOES } from "@/types/database";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
const HOURS = ["07:00", "08:00", "08:50", "09:00", "09:50", "10:00", "10:50", "11:00", "11:50", "12:00"];

interface ConsultaHoje {
  id: number;
  hora: string;
  paciente_nome: string;
  paciente_id: number;
  profissional_id: number;
  profissional_nome: string;
  profissional_funcao: string;
  data: string;
  observacoes: string | null;
}

interface Pac { id: number; nome: string; }
interface Usr { id: number; nome: string; }

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalPacientes:0, pacientesAtivos:0, totalUsuarios:0, consultasHoje:0 });
  const [hoje, setHoje]   = useState<ConsultaHoje[]>([]);
  const [cal, setCal]     = useState(new Date());
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pacs, setPacs] = useState<Pac[]>([]);
  const [usrs, setUsrs] = useState<Usr[]>([]);
  const [form, setForm] = useState({ paciente_id: "", profissional_id: "", data: today(), hora: "08:00", observacoes: "" });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const [s, h] = await Promise.all([
      fetch("/api/dashboard/stats").then(r=>r.json()),
      fetch("/api/consultas/hoje").then(r=>r.json()),
    ]);
    if (s.error) { router.push("/login"); return; }
    setStats(s);
    setHoje(Array.isArray(h) ? h : []);
  }, [router]);

  useEffect(()=>{ 
    load();
    fetch("/api/pacientes").then(r => r.json()).then(d => { if (Array.isArray(d)) setPacs(d); });
    fetch("/api/usuarios").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsrs(d); });
  },[load]);

  const year = cal.getFullYear(), month = cal.getMonth();
  const first = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const todayDate = new Date();
  type DayCell = {d:number;type:"prev"|"curr"|"next"};
  const cells: DayCell[] = [];
  for (let i=0;i<first;i++) cells.push({d:new Date(year,month,-first+i+1).getDate(),type:"prev"});
  for (let d=1;d<=daysInMonth;d++) cells.push({d,type:"curr"});
  const trail = 7-((first+daysInMonth)%7||7);
  for (let d=1;d<=trail&&trail<7;d++) cells.push({d,type:"next"});

  // Formatar data de hoje para exibição
  const todayFormatted = `${String(todayDate.getDate()).padStart(2, '0')} de ${MESES[todayDate.getMonth()]}`;

  const getRoleColor = (funcao: string) => {
    const roles = funcao.split(",").map(r => r.trim());
    if (roles.includes("Super Admin")) return CORES_FUNCOES["Super Admin"];
    if (roles.includes("Administrador")) return CORES_FUNCOES["Administrador"];
    if (roles.includes("Médica Cardiologista")) return CORES_FUNCOES["Médica Cardiologista"];
    if (roles.includes("Fisioterapeuta Cardiovascular")) return CORES_FUNCOES["Fisioterapeuta Cardiovascular"];
    if (roles.includes("Secretária")) return CORES_FUNCOES["Secretária"];
    return "var(--lime)";
  };

  async function openModal(consultaId?: number) {
    if (consultaId) {
      const consulta = hoje.find(c => c.id === consultaId);
      if (consulta) {
        setEditingId(consultaId);
        setForm({
          paciente_id: String(consulta.paciente_id),
          profissional_id: String(consulta.profissional_id),
          data: consulta.data,
          hora: consulta.hora,
          observacoes: consulta.observacoes || ""
        });
        setModal(true);
      }
    }
  }

  async function save() {
    if (!form.paciente_id || !form.profissional_id || !form.data || !form.hora) {
      showToast("Preencha todos os campos", "error");
      return;
    }
    
    const body = {
      paciente_id: Number(form.paciente_id),
      profissional_id: Number(form.profissional_id),
      data: form.data,
      hora: form.hora,
      observacoes: form.observacoes
    };

    const res = await fetch(`/api/consultas/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const d = await res.json();
      showToast(d.error || "Erro", "error");
      return;
    }

    setModal(false);
    showToast("Consulta atualizada!", "success");
    load();
  }

  async function del(id: number) {
    if (!confirm("Cancelar esta consulta?")) return;
    const res = await fetch(`/api/consultas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      showToast(d.error || "Erro", "error");
      return;
    }
    showToast("Consulta cancelada.", "success");
    load();
  }

  return (
    <div>
      {/* STAT CARDS */}
      <div className="stats-grid">
        {[
          {label:"Total de pacientes",  value:stats.totalPacientes},
          {label:"Pacientes ativos",    value:stats.pacientesAtivos},
          {label:"Total de usuários",   value:stats.totalUsuarios},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-icon">
              <svg width="44" height="42" viewBox="0 0 44 42" fill="none">
                <path d="M32 13.75C32 19.415 27.523 24 22 24C16.477 24 12 19.415 12 13.75C12 8.085 16.477 3.5 22 3.5C27.523 3.5 32 8.085 32 13.75Z" fill="#002d49" opacity="0.3"/>
                <path d="M2 38.5C2 31.873 11.163 26.5 22 26.5C32.837 26.5 42 31.873 42 38.5" stroke="#002d49" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{String(s.value).padStart(2,"0")}</div>
          </div>
        ))}
      </div>

      {/* DASH GRID */}
      <div className="dash-grid">
        {/* CALENDÁRIO */}
        <div className="card">
          <div className="cal-header">
            <span className="cal-title">Calendário</span>
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={()=>setCal(new Date(year,month-1,1))}>‹</button>
              <span className="cal-month-label">{MESES[month]} {year}</span>
              <button className="cal-nav-btn" onClick={()=>setCal(new Date(year,month+1,1))}>›</button>
            </div>
          </div>
          <div className="cal-divider"/>
          <div className="cal-grid">
            {DIAS_SEMANA.map(d=><div key={d} className="cal-dow">{d}</div>)}
            {cells.map((c,i)=>{
              const isToday = c.type==="curr" && c.d===todayDate.getDate() && month===todayDate.getMonth() && year===todayDate.getFullYear();
              return (
                <div key={i} className={`cal-day${isToday?" today":c.type!=="curr"?" other":""}`}>
                  {c.d}
                </div>
              );
            })}
          </div>
        </div>

        {/* CONSULTAS DO DIA */}
        <div className="card">
          <div className="cd-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="cd-title">Consultas do dia</span>
              <span style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: '500' }}>{todayFormatted}</span>
            </div>
            <span className="cd-count">{String(hoje.length).padStart(2,"0")}</span>
          </div>
          <div className="cd-divider"/>
          {hoje.length===0
            ? <div className="cd-empty">Nenhuma consulta hoje.</div>
            : hoje.map((c,i)=>(
              <div key={i} className="cd-slot" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <span className="cd-time">{c.hora}</span>
                <button 
                  className="cd-chip" 
                  onClick={() => openModal(c.id)}
                  style={{ 
                    backgroundColor: getRoleColor(c.profissional_funcao),
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    flex: 1,
                    textAlign: 'left'
                  }}
                >
                  {c.paciente_nome.split(" ")[0]} {c.paciente_nome.split(" ").slice(-1)[0]}
                </button>
                <button 
                  className="icon-btn" 
                  title="Remover" 
                  onClick={() => del(c.id)}
                  style={{ color: 'var(--red)', padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-title">Editar Consulta</div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Paciente</label>
                <select className="form-select" value={form.paciente_id} onChange={e => set("paciente_id", e.target.value)}>
                  <option value="">Selecione um paciente</option>
                  {pacs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="form-group form-full">
                <label className="form-label">Profissional</label>
                <select className="form-select" value={form.profissional_id} onChange={e => set("profissional_id", e.target.value)}>
                  <option value="">Selecione um profissional</option>
                  {usrs.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input className="form-input" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Hora</label>
                <select className="form-select" value={form.hora} onChange={e => set("hora", e.target.value)}>
                  {HOURS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div className="form-group form-full">
                <label className="form-label">Observações</label>
                <textarea className="form-textarea" rows={3} value={form.observacoes} onChange={e => set("observacoes", e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-lime" onClick={save}>Atualizar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast show${toast.type ? " " + toast.type : ""}`}>{toast.msg}</div>}
    </div>
  );
}
