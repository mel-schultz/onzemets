"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

interface Paciente { id: number; nome: string; sexo: string | null; data_nasc: string | null; ultima_consulta: string | null; proxima_consulta: string | null; faltas: number; cpf: string | null; telefone: string | null; telefone2: string | null; email: string | null; cep: string | null; rua: string | null; numero: string | null; complemento: string | null; bairro: string | null; cidade: string | null; estado: string | null; }
interface Evolucao { id: number; titulo: string; texto: string; tipo: string; data: string; criado_por_nome: string | null; }

function fmtDate(iso: string | null) { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }
function calcAge(nasc: string | null) { if (!nasc) return "?"; const b = new Date(nasc), t = new Date(); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a; }
function todayISO() { return new Date().toISOString().split("T")[0]; }

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [evos, setEvos] = useState<Evolucao[]>([]);
  const [tab, setTab] = useState<"perfil" | "dados" | "evolucoes">("perfil");
  const [modalEvo, setModalEvo] = useState(false);
  const [editEvoId, setEditEvoId] = useState<number | null>(null);
  const [evoForm, setEvoForm] = useState({ titulo: "", texto: "", tipo: "clinica", data: todayISO() });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type = "") { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); }

  const load = useCallback(async () => {
    const [p, e] = await Promise.all([
      fetch(`/api/pacientes/${id}`).then(r => r.json()),
      fetch(`/api/pacientes/${id}/evolucoes`).then(r => r.json()),
    ]);
    if (p.error) { router.push("/pacientes"); return; }
    setPaciente(p);
    setEvos(Array.isArray(e) ? e : []);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function saveEvo() {
    if (!evoForm.titulo || !evoForm.texto) { showToast("Preencha título e texto", "error"); return; }
    const url = editEvoId ? `/api/pacientes/${id}/evolucoes/${editEvoId}` : `/api/pacientes/${id}/evolucoes`;
    const method = editEvoId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(evoForm) });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "Erro", "error"); return; }
    setModalEvo(false);
    showToast("Evolução salva!", "success");
    load();
  }

  async function delEvo(eid: number) {
    if (!confirm("Remover esta evolução?")) return;
    await fetch(`/api/pacientes/${id}/evolucoes/${eid}`, { method: "DELETE" });
    showToast("Evolução removida.", "success");
    load();
  }

  if (!paciente) return <div className="loading"><span className="spinner" />Carregando...</div>;

  const clinicas = evos.filter(e => e.tipo === "clinica");
  const reab     = evos.filter(e => e.tipo !== "clinica");

  const dados = [
    ["Nome", paciente.nome], ["Data de nascimento", fmtDate(paciente.data_nasc)],
    ["CPF", paciente.cpf || "—"], ["Telefone", paciente.telefone || "—"],
    ["Telefone alternativo", paciente.telefone2 || "—"], ["E-mail", paciente.email || "—"],
    ["Rua", paciente.rua || "—"], ["Número", paciente.numero || "—"],
    ["Complemento", paciente.complemento || "—"], ["CEP", paciente.cep || "—"],
    ["Bairro", paciente.bairro || "—"], ["Cidade", paciente.cidade || "—"], ["Estado", paciente.estado || "—"],
  ];

  return (
    <div>
      {/* PATIENT BAR */}
      <div className="patient-bar">
        <button className="btn btn-outline btn-sm" onClick={() => router.push("/pacientes")}>← Voltar</button>
        <div className="patient-name">{paciente.nome}</div>
        <div className="ptags">
          <div className="ptag">{paciente.sexo === "Masculino" ? "♂" : "♀"} {paciente.sexo || "—"}</div>
          <div className="ptag">🎂 {calcAge(paciente.data_nasc)} anos</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {["perfil", "dados", "evolucoes"].map(t => (
            <button key={t} className={`btn btn-sm${tab === t ? " btn-lime" : " btn-outline"}`} onClick={() => setTab(t as "perfil" | "dados" | "evolucoes")}>
              {t === "perfil" ? "Perfil" : t === "dados" ? "Dados" : "Evoluções"}
            </button>
          ))}
        </div>
      </div>

      {/* TAB: PERFIL */}
      {tab === "perfil" && (
        <>
          <div className="detail-stats">
            {[
              { label: "Última Consulta", value: fmtDate(paciente.ultima_consulta) },
              { label: "Próxima Consulta", value: fmtDate(paciente.proxima_consulta) },
              { label: "Faltas", value: String(paciente.faltas) },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="detail-grid">
            <div className="pcard">
              <div className="pcard-head">
                <div className="pcard-title">📋 Atualização Clínica</div>
              </div>
              <div className="pcard-divider" />
              {clinicas.length > 0 ? <>
                <div className="pcard-date">{fmtDate(clinicas[0].data)}</div>
                <div className="pcard-text">{clinicas[0].texto}</div>
              </> : <div className="pcard-text" style={{ color: "var(--gray)" }}>Nenhuma evolução clínica.</div>}
              <div className="pcard-actions">
                <button className="btn btn-outline btn-sm" onClick={() => { setTab("evolucoes"); }}>Ver todas</button>
                <button className="btn btn-lime btn-sm" onClick={() => { setEditEvoId(null); setEvoForm({ titulo: "", texto: "", tipo: "clinica", data: todayISO() }); setModalEvo(true); }}>+ Nova</button>
              </div>
            </div>
            <div className="pcard">
              <div className="pcard-head">
                <div className="pcard-title">🏃 Evolução de Reabilitação</div>
              </div>
              <div className="pcard-divider" />
              {reab.length > 0 ? <>
                <div className="pcard-date">{reab[0].titulo}</div>
                <div className="pcard-text">{reab[0].texto}</div>
              </> : <div className="pcard-text" style={{ color: "var(--gray)" }}>Nenhuma evolução de reabilitação.</div>}
            </div>
          </div>
        </>
      )}

      {/* TAB: DADOS */}
      {tab === "dados" && (
        <div className="card">
          {dados.map(([l, v]) => (
            <div key={l} className="data-row">
              <div className="data-label">{l}</div>
              <div className="data-val">{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: EVOLUÇÕES */}
      {tab === "evolucoes" && (
        <div className="card">
          <div className="page-header">
            <div className="page-title">Evoluções</div>
            <button className="btn btn-lime btn-sm" onClick={() => { setEditEvoId(null); setEvoForm({ titulo: "", texto: "", tipo: "clinica", data: todayISO() }); setModalEvo(true); }}>+ Nova Evolução</button>
          </div>
          <div className="evo-list">
            {evos.length === 0 ? <p style={{ color: "var(--gray)", fontSize: 14 }}>Nenhuma evolução registrada.</p>
              : evos.map(e => (
                <div key={e.id} className="evo-card">
                  <div className="evo-num">{e.titulo}<span className="evo-date">{fmtDate(e.data)}</span></div>
                  <div className="evo-txt">{e.texto}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditEvoId(e.id); setEvoForm({ titulo: e.titulo, texto: e.texto, tipo: e.tipo, data: e.data }); setModalEvo(true); }}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => delEvo(e.id)}>🗑 Remover</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL EVOLUÇÃO */}
      {modalEvo && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModalEvo(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModalEvo(false)}>✕</button>
            <div className="modal-title">{editEvoId ? "Editar Evolução" : "Nova Evolução"}</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" value={evoForm.titulo} onChange={e => setEvoForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={evoForm.tipo} onChange={e => setEvoForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="clinica">Clínica</option>
                  <option value="reabilitacao">Reabilitação</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input className="form-input" type="date" value={evoForm.data} onChange={e => setEvoForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Texto *</label>
                <textarea className="form-textarea" rows={5} value={evoForm.texto} onChange={e => setEvoForm(f => ({ ...f, texto: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModalEvo(false)}>Cancelar</button>
              <button className="btn btn-lime" onClick={saveEvo}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast show${toast.type ? " " + toast.type : ""}`}>{toast.msg}</div>}
    </div>
  );
}
