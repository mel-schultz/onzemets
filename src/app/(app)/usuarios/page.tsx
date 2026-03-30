"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FUNCOES_DISPONIVEIS } from "@/types/database";

interface U {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  status: string;
  criado_em: string;
}

function ini(n: string) {
  return n.split(" ").slice(0, 2).map(x => x[0]).join("").toUpperCase();
}

export default function UsuariosPage() {
  const router = useRouter();
  const [me, setMe] = useState<U | null>(null);
  const [list, setList] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ 
    nome: "", 
    email: "", 
    senha: "", 
    funcao: [] as string[], 
    status: "ativo" 
  });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const s = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    // Buscar dados do usuário logado
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    setMe(meData);

    // Buscar lista de usuários (apenas se for admin/super admin)
    const res = await fetch("/api/usuarios");
    if (res.ok) {
      setList(await res.json());
    } else if (res.status === 401) {
      router.push("/login");
    } else {
      // Se não puder listar todos, mostrar apenas o próprio
      setList([meData]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const isAdmin = (funcao: string) => {
    const roles = funcao.split(",").map(r => r.trim());
    return roles.includes("Administrador") || roles.includes("Super Admin");
  };

  const isSuper = (funcao: string) => {
    return funcao.split(",").map(r => r.trim()).includes("Super Admin");
  };

  function openAdd() {
    setEditId(null);
    setForm({ nome: "", email: "", senha: "", funcao: ["Fisioterapeuta Cardiovascular"], status: "ativo" });
    setModal(true);
  }

  function openEdit(u: U) {
    setEditId(u.id);
    setForm({
      nome: u.nome,
      email: u.email,
      senha: "",
      funcao: u.funcao.split(",").map(r => r.trim()),
      status: u.status
    });
    setModal(true);
  }

  async function save() {
    if (!form.nome || !form.email) {
      showToast("Preencha nome e e-mail", "error");
      return;
    }
    if (!editId && !form.senha) {
      showToast("Digite uma senha", "error");
      return;
    }

    const body: any = {
      nome: form.nome,
      email: form.email,
      funcao: form.funcao.join(", "),
      status: form.status
    };
    if (form.senha) body.senha = form.senha;

    const url = editId ? `/api/usuarios/${editId}` : "/api/usuarios";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const d = await res.json();
      showToast(d.error || "Erro", "error");
      return;
    }

    setModal(false);
    showToast(editId ? "Usuário atualizado!" : "Usuário cadastrado!", "success");
    load();
  }

  const toggleRole = (role: string) => {
    setForm(f => {
      const current = f.funcao;
      if (current.includes(role)) {
        return { ...f, funcao: current.filter(r => r !== role) };
      } else {
        return { ...f, funcao: [...current, role] };
      }
    });
  };

  const canEditRoles = me && isAdmin(me.funcao);
  const isSuperAdmin = me && isSuper(me.funcao);

  return (
    <div>
      <div className="card">
        <div className="page-header">
          <div className="page-title">Usuários</div>
          {canEditRoles && (
            <button className="btn btn-lime" onClick={openAdd}>+ Cadastrar</button>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Funções</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="loading"><span className="spinner" />Carregando...</td></tr>
              ) : list.map(u => (
                <tr key={u.id}>
                  <td><div className="td-user"><div className="mini-av">{ini(u.nome)}</div>{u.nome}</div></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {u.funcao.split(",").map(f => (
                        <span key={f} className="badge" style={{ whiteSpace: 'nowrap' }}>{f.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`pill pill-${u.status}`}>{u.status === "ativo" ? "Ativo" : "Inativo"}</span></td>
                  <td>
                    <div className="actions">
                      {(canEditRoles || (me && me.id === u.id)) && (
                        <button className="icon-btn" title="Editar" onClick={() => openEdit(u)}>✏️</button>
                      )}
                    </div>
                  </td>
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
                <input className="form-input" value={form.nome} onChange={e => s("nome", e.target.value)} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => s("email", e.target.value)} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">{editId ? "Nova Senha (deixe em branco para manter)" : "Senha *"}</label>
                <input className="form-input" type="password" value={form.senha} onChange={e => s("senha", e.target.value)} />
              </div>
              
              {canEditRoles && (
                <>
                  <div className="form-group form-full">
                    <label className="form-label">Funções</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      {FUNCOES_DISPONIVEIS.map(f => {
                        const isSuperRole = f === "Super Admin";
                        if (isSuperRole && !isSuperAdmin) return null;
                        
                        return (
                          <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input 
                              type="checkbox" 
                              checked={form.funcao.includes(f)} 
                              onChange={() => toggleRole(f)}
                              style={{ accentColor: 'var(--lime)' }}
                            />
                            {f}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => s("status", e.target.value)}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </>
              )}
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
