"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { href: "/dashboard",  icon: "🏠", label: "Dashboard" },
  { href: "/pacientes",  icon: "👤", label: "Pacientes" },
  { href: "/consultas",  icon: "📅", label: "Consultas" },
  { href: "/usuarios",   icon: "👥", label: "Usuários" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pacientes": "Pacientes",
  "/consultas": "Consultas",
  "/usuarios":  "Usuários",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; nome: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDd, setUserDd] = useState(false);
  const [userName, setUserName] = useState("...");
  const [userInitials, setUserInitials] = useState("?");
  const [userFuncao, setUserFuncao] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "OnzeMETs";
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(u => {
      if (u?.id) {
        setUserName(u.nome.split(" ")[0]);
        setUserInitials(u.nome.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase());
        setUserFuncao(u.funcao);
      }
    });
  }, []);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/pacientes?q=${encodeURIComponent(searchQ)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 7));
      setSearchOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const displayName = userFuncao?.startsWith("Méd") ? `Dra. ${userName}` : userName;

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo">
            <div className="logo-icon">11M</div>
            <div className="logo-text">onze<strong>METs</strong></div>
          </div>
        </div>
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className={`nav-item${pathname.startsWith(n.href) ? " active" : ""}`}>
            <span className="nav-icon">{n.icon}</span> {n.label}
          </Link>
        ))}
      </aside>

      {/* CONTENT */}
      <div className="content-col">
        {/* TOPBAR */}
        <div className="topbar-wrap">
          <div className="topbar">
            <span className="topbar-title">{title}</span>
            <div className="topbar-date">📅 {today}</div>
            <div className="topbar-spacer" />
            {/* SEARCH */}
            <div className="search-wrap" ref={searchRef}>
              <div className="search-box">
                <span>🔍</span>
                <input placeholder="Buscar paciente…" value={searchQ}
                  onChange={e => setSearchQ(e.target.value)} />
              </div>
              <div className={`search-dropdown${searchOpen ? " open" : ""}`}>
                {searchResults.length === 0
                  ? <div className="search-item" style={{ color: "var(--gray)" }}>Nenhum resultado</div>
                  : searchResults.map(p => (
                    <div key={p.id} className="search-item" onClick={() => {
                      setSearchOpen(false); setSearchQ("");
                      router.push(`/pacientes/${p.id}`);
                    }}>{p.nome}</div>
                  ))}
              </div>
            </div>
            {/* USER DROPDOWN */}
            <div className="user-btn" onClick={() => setUserDd(v => !v)}>
              <div className="user-avatar">{userInitials}</div>
              <span className="user-name">{displayName}</span>
              <span className="user-arrow">▾</span>
              <div className={`user-dropdown${userDd ? " open" : ""}`}>
                <div className="dropdown-item danger" onClick={doLogout}>Sair</div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="page-scroll">{children}</div>

        {/* FOOTER */}
        <div className="app-footer">
          <span>© 2025 OnzeMETs</span>
        </div>
      </div>
    </div>
  );
}
