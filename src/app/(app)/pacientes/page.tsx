"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Paciente {
  id: number; nome: string; cpf: string | null; telefone: string | null;
  ultima_consulta: string | null; status: "ativo" | "inativo";
  data_nasc: string | null; sexo: string | null; telefone2: string | null;
  email: string | null; cep: string | null; rua: string | null;
  numero: string | null; complemento: string | null; bairro: string | null;
  cidade: string | null; estado: string | null;
}

function initials(nome: string) { return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase(); }
function fmtDate(iso: string | null) { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }
function todayISO() { return new Date().toISOString().split("T")[0]; }

const EMPTY: Partial<Paciente> = { nome: "", data_nasc: "", cpf: "", sexo: "Feminino", telefone: "", telefone2: "", email: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", status: "ativo" };

export default function PacientesPage() {
  const router = useRouter();
  const [list, setList] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Paciente>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type = "") { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); }
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pacientes");
    if (res.status === 401) { router.push("/login"); return; }
    setList(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditId(null); setForm(EMPTY); setModal(true); }
  function openEdit(p: Paciente) { setEditId(p.id); setForm(p); setModal(true); }

  async function save() {
    if (!form.nome?.trim()) { showToast("Nome é obrigatório", "error"); return; }
    const url = editId ? `/api/pacientes/${editId}` : "/api/pacientes";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "Erro", "error"); return; }
    setModal(false);
    showToast(editId ? "Paciente atualizado!" : "Paciente cadastrado!", "success");
    load();
  }

  async function del(id: number) {
    if (!confirm("Remover este paciente?")) return;
    await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    showToast("Paciente removido.", "success");
    load();
  }

  return (
    <div>
      <div className="card">
        <div className="page-header">
          <div className="page-title">Lista de Pacientes</div>
          <button className="btn btn-lime btn-sm" onClick={openAdd}>+ Cadastrar Paciente</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Paciente</th><th>CPF</th><th>Telefone</th>
                <th>Última Consulta</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="loading"><span className="spinner" />Carregando...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--gray)", padding: 30 }}>Nenhum paciente cadastrado.</td></tr>
              ) : list.map(p => (
                <tr key={p.id}>
                  <td><div className="td-user"><div className="mini-av">{initials(p.nome)}</div>{p.nome}</div></td>
                  <td>{p.cpf || "—"}</td>
                  <td>{p.telefone || "—"}</td>
                  <td>{fmtDate(p.ultima_consulta)}</td>
                  <td><span className={`pill pill-${p.status}`}>{p.status === "ativo" ? "Ativo" : "Inativo"}</span></td>
                  <td><div className="actions">
                    <button className="icon-btn" title="Ver perfil" onClick={() => router.push(`/pacientes/${p.id}`)}>👁</button>
                    <button className="icon-btn" title="Editar" onClick={() => openEdit(p)}>✏️</button>
                    <button className="icon-btn" title="Remover" onClick={() => del(p.id)}>🗑</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-title">{editId ? "Editar Paciente" : "Cadastrar Paciente"}</div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Nome do paciente *</label>
                <input className="form-input" value={form.nome || ""} onChange={e => set("nome", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Data de nascimento</label>
                <input className="form-input" type="date" value={form.data_nasc || ""} onChange={e => set("data_nasc", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select className="form-select" value={form.sexo || "Feminino"} onChange={e => set("sexo", e.target.value)}>
                  <option>Feminino</option><option>Masculino</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input className="form-input" value={form.cpf || ""} onChange={e => set("cpf", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status || "ativo"} onChange={e => set("status", e.target.value)}>
                  <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone 2</label>
                <input className="form-input" value={form.telefone2 || ""} onChange={e => set("telefone2", e.target.value)} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="form-group"><label className="form-label">CEP</label><input className="form-input" value={form.cep || ""} onChange={e => set("cep", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Rua</label><input className="form-input" value={form.rua || ""} onChange={e => set("rua", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Número</label><input className="form-input" value={form.numero || ""} onChange={e => set("numero", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Complemento</label><input className="form-input" value={form.complemento || ""} onChange={e => set("complemento", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Bairro</label><input className="form-input" value={form.bairro || ""} onChange={e => set("bairro", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Cidade</label><input className="form-input" value={form.cidade || ""} onChange={e => set("cidade", e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Estado</label><input className="form-input" value={form.estado || ""} onChange={e => set("estado", e.target.value)} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-lime" onClick={save}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast show${toast.type ? " " + toast.type : ""}`}>{toast.msg}</div>}
    </div>
  );
}
