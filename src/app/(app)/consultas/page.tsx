"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CORES_FUNCOES } from "@/types/database";

interface C {
  id: number;
  paciente_id: number;
  profissional_id: number;
  data: string;
  hora: string;
  observacoes: string | null;
  paciente_nome: string;
  profissional_nome: string;
  profissional_funcao: string;
}
interface Pac { id: number; nome: string; }
interface Usr { id: number; nome: string; }

function off(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}
function today() {
  return new Date().toISOString().split("T")[0];
}
const HOURS = ["07:00", "08:00", "08:50", "09:00", "09:50", "10:00", "10:50", "11:00", "11:50", "12:00"];

export default function ConsultasPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<C[]>([]);
  const [pacs, setPacs] = useState<Pac[]>([]);
  const [usrs, setUsrs] = useState<Usr[]>([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ paciente_id: "", profissional_id: "", data: today(), hora: "08:00", observacoes: "" });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const days = Array.from({ length: 6 }, (_, i) => off(i));

  function showToast(msg: string, type = "") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const res = await fetch(`/api/consultas?data_inicio=${days[0]}&data_fim=${days[5]}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setConsultas(await res.json());
  }, [router, days]);

  useEffect(() => {
    load();
    fetch("/api/pacientes").then(r => r.json()).then(d => { if (Array.isArray(d)) setPacs(d); });
    fetch("/api/usuarios").then(r => r.json()).then(d => { if (Array.isArray(d)) setUsrs(d); });
  }, [load]);

  async function openModal(consultaId?: number) {
    if (consultaId) {
      // Modo edição
      const consulta = consultas.find(c => c.id === consultaId);
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
    } else {
      // Modo novo
      setEditingId(null);
      setForm({ paciente_id: String(pacs[0]?.id || ""), profissional_id: String(usrs[0]?.id || ""), data: today(), hora: "08:00", observacoes: "" });
      setModal(true);
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

    const url = editingId ? `/api/consultas/${editingId}` : "/api/consultas";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const d = await res.json();
      showToast(d.error || "Erro", "error");
      return;
    }

    setModal(false);
    showToast(editingId ? "Consulta atualizada!" : "Consulta agendada!", "success");
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

  // Função para pegar a cor baseada no papel principal
  const getRoleColor = (funcao: string) => {
    const roles = funcao.split(",").map(r => r.trim());
    // Prioridade de cor: Super Admin > Admin > Médica > Fisioterapeuta > Secretária
    if (roles.includes("Super Admin")) return CORES_FUNCOES["Super Admin"];
    if (roles.includes("Administrador")) return CORES_FUNCOES["Administrador"];
    if (roles.includes("Médica Cardiologista")) return CORES_FUNCOES["Médica Cardiologista"];
    if (roles.includes("Fisioterapeuta Cardiovascular")) return CORES_FUNCOES["Fisioterapeuta Cardiovascular"];
    if (roles.includes("Secretária")) return CORES_FUNCOES["Secretária"];
    return "var(--lime)"; // Cor padrão
  };

  return (
    <div>
      <div className="card">
        <div className="page-header">
          <div className="page-title">Grade de Consultas</div>
          <button className="btn btn-lime" onClick={() => openModal()}>+ Agendar Consulta</button>
        </div>
        <div className="sched-wrap">
          <div className="sched-grid">
            <div className="sched-hdr">Hora</div>
            {days.map(d => {
              const [y, m, dd] = d.split("-");
              return <div key={d} className="sched-hdr">{`${dd} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][parseInt(m) - 1]}`}</div>;
            })}
            {HOURS.map(h => (
              [
                <div key={"t" + h} className="sched-time">{h}</div>,
                ...days.map(d => {
                  const c = consultas.find(x => x.data === d && x.hora === h);
                  return (
                    <div key={d + h} className="sched-cell">
                      {c && (
                        <div 
                          className="sched-event" 
                          style={{ 
                            backgroundColor: getRoleColor(c.profissional_funcao),
                            color: '#fff',
                            borderColor: 'transparent',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          onClick={() => openModal(c.id)}
                        >
                          <span style={{ fontWeight: 'bold' }}>{c.paciente_nome.split(" ")[0]}</span>
                          <span style={{ fontSize: '10px', opacity: 0.9, display: 'block' }}>{c.profissional_nome.split(" ")[0]}</span>
                          <button 
                            className="sched-event-del" 
                            style={{ color: '#fff' }}
                            onClick={e => { e.stopPropagation(); del(c.id); }}
                          >✕</button>
                        </div>
                      )}
                    </div>
                  );
                })
              ]
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-title">{editingId ? "Editar Consulta" : "Agendar Consulta"}</div>
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
              <button className="btn btn-lime" onClick={save}>{editingId ? "Atualizar" : "Agendar"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`toast show${toast.type ? " " + toast.type : ""}`}>{toast.msg}</div>}
    </div>
  );
}
