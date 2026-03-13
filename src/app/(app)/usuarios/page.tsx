"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Usuario { id: number; nome: string; email: string; funcao: string; status: "ativo" | "inativo"; criado_em: string; }

function initials(nome: string) { return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase(); }

const FUNCOES = ["Médica Cardiologista","Fisioterapeuta Cardiovascular","Administrador"];

export default function UsuariosPage() {
  const router = useRouter();
  const [list, setList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", funcao: FUNCOES[0], status: "ativo" });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type = "") { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); }
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/usuarios");
    if (res.status === 401) { router.push("/login"); return; }
    setList(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditId(null); setForm({ nome: "", email: "", senha: "", funcao: FUNCOES[0], status: "ativo" }); setModal(true); }
  function openEdit(u: Usuario) { setEditId(u.id); setForm({ nome: u.nome, email: u.email, senha: "", funcao: u.funcao, status: u.status }); setModal(true); }

  async function save() {
    if (!form.nome || !form.email) { showToast("Preencha nome e e-mail", "error"); return; }
    if (!editId && !form.senha) { showToast("Digite uma senha", "error"); return; }
    const body: Record<string, string> = { nome: form.nome, email: form.email, funcao: form.funcao, status: form.status };
    if (form.senha) body.senha = form.senha;
    const url = editId ? `/api/usuarios/${editId}` : "/api/usuarios";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "Erro", "error"); return; }
    setModal(false);
    showToast(editId ? "Usuário atualizado!" : "Usuário cadastrado!", "success");
    load();
  }

  async function del(id: number) {
    if (!confirm("Remover este usuário?")) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); showToast(d.error || "Erro", "error"); return; }
    showToast("Usuário removido.", "success");
    load();
  }

  return (
    <div>
      <div className="card">
        <div className="page-header">
          <div className="page-title">Equipe</div>
          <button className="btn btn-lime btn-sm" onClick={openAdd}>+ Cadastrar Usuário</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Profissional</th><th>Função</th><th>E-mail</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="loading"><span className="spinner" />Carregando...</td></tr>
              ) : list.map(u => (
                <tr key={u.id}>
                  <td><div className="td-user"><div className="mini-av">{initials(u.nome)}</div>{u.nome}</div></td>
                  <td><span className="badge">{u.funcao}</span></td>
                  <td>{u.email}</td>
                  <td><span className={`pill pill-${u.status}`}>{u.status === "ativo" ? "Ativo" : "Inativo"}</span></td>
                  <td><div className="actions">
                    <button className="icon-btn" title="Editar" onClick={() => openEdit(u)}>✏️</button>
                    <button className="icon-btn" title="Remover" onClick={() => del(u.id)}>🗑</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-title">{editId ? "Editar Usuário" : "Cadastrar Usuário"}</div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Nome *</label>
                <input className="form-input" value={form.nome} onChange={e => set("nome", e.target.value)} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              {!editId && (
                <div className="form-group form-full">
                  <label className="form-label">Senha *</label>
                  <input className="form-input" type="password" value={form.senha} onChange={e => set("senha", e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Função</label>
                <select className="form-select" value={form.funcao} onChange={e => set("funcao", e.target.value)}>
                  {FUNCOES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
                  <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
                </select>
              </div>
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
