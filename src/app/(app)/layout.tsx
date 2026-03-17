"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// ── Icons — base64 inline SVG paths from Figma ─────────────────
const ICONS = {
  dashboard: "📈",
  pacientes: "👤",
  consultas: "📅",
  relatorios: "📊",
  config: "⚙️",
  usuarios: "👥",
};

const NAV = [
  { href: "/dashboard", icon: ICONS.dashboard, label: "Dashboard" },
  { href: "/pacientes", icon: ICONS.pacientes,  label: "Pacientes" },
  { href: "/consultas", icon: ICONS.consultas,  label: "Consultas" },
  { href: "/usuarios",  icon: ICONS.usuarios,   label: "Usuários" },
];
const NAV_DISABLED = [
  { icon: ICONS.relatorios, label: "Relatórios" },
  { icon: ICONS.config,     label: "Configurações" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pacientes": "Pacientes",
  "/consultas": "Consultas",
  "/usuarios":  "Usuários",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [searchQ, setSearchQ]     = useState("");
  const [results, setResults]     = useState<{ id: number; nome: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDd, setUserDd]       = useState(false);
  const [name, setName]           = useState("...");
  const [initials, setInitials]   = useState("?");
  const [funcao, setFuncao]       = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const titleKey = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k)) ?? "/dashboard";
  const title = PAGE_TITLES[titleKey] ?? "OnzeMETs";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(u => {
      if (!u?.id) return;
      const parts = u.nome.trim().split(" ");
      setInitials(parts.slice(0,2).map((p: string) => p[0]).join("").toUpperCase());
      const first = parts[0];
      setName(u.funcao?.startsWith("Méd") ? `Dra. ${first}` : first);
      setFuncao(u.funcao);
    });
  }, []);

  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); setSearchOpen(false); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/pacientes?q=${encodeURIComponent(searchQ)}`);
      const data = await res.json();
      if (Array.isArray(data)) { setResults(data.slice(0, 7)); setSearchOpen(true); }
    }, 200);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (!(e.target as Element).closest(".user-btn")) setUserDd(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">11M</div>
          <div className="logo-text">onze<strong>METs</strong></div>
        </div>
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-link${pathname.startsWith(n.href) ? " active" : ""}`}
          >
            <span className="nav-icon" style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </Link>
        ))}
        {NAV_DISABLED.map(n => (
          <div key={n.label} className="nav-link disabled">
            <span className="nav-icon" style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </aside>

      {/* ── CONTENT ── */}
      <div className="content-col">
        {/* TOPBAR */}
        <div className="topbar-wrap">
          <div className="topbar">
            <span className="topbar-title">{title}</span>
            <div className="topbar-date">
              <span style={{ fontSize: 16 }}>📅</span>
              {today}
            </div>
            <div className="topbar-spacer" />

            {/* Search */}
            <div className="search-wrap" ref={searchRef}>
              <div className="search-box">
                <input
                  placeholder="Procurar paciente"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className={`search-dropdown${searchOpen ? " open" : ""}`}>
                {results.length === 0
                  ? <div className="search-item" style={{ color: "var(--gray)" }}>Nenhum resultado</div>
                  : results.map(p => (
                    <div key={p.id} className="search-item" onClick={() => {
                      setSearchOpen(false); setSearchQ("");
                      router.push(`/pacientes/${p.id}`);
                    }}>{p.nome}</div>
                  ))}
              </div>
            </div>

            {/* User */}
            <div className="user-btn" onClick={() => setUserDd(v => !v)}>
              <div className="user-av">{initials}</div>
              <span className="user-name">{name}</span>
              <span className="user-arrow">▾</span>
              <div className={`user-dd${userDd ? " open" : ""}`}>
                <div className="dd-item danger" onClick={logout}>Sair</div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE */}
        <div className="page-scroll">{children}</div>

        {/* FOOTER */}
        <div className="app-footer">
          <div className="footer-left">
            <span className="footer-link">❓ Suporte</span>
            <span className="footer-link">◇ Versão 1.2.26</span>
          </div>
          <span>By Factum Creations</span>
        </div>
      </div>
    </div>
  );
}
