"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalPacientes: 0, pacientesAtivos: 0, totalUsuarios: 0, consultasHoje: 0 });
  const [hoje, setHoje] = useState<{ hora: string; paciente_nome: string; paciente_id: number }[]>([]);
  const [calDate, setCalDate] = useState(new Date());

  const load = useCallback(async () => {
    const [s, h] = await Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/consultas/hoje").then(r => r.json()),
    ]);
    if (s.error) { router.push("/login"); return; }
    setStats(s);
    setHoje(Array.isArray(h) ? h : []);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  // Calendar
  const year = calDate.getFullYear(), month = calDate.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const t = new Date();
  const calDays: { d: number; type: "other" | "today" | "normal" }[] = [];
  for (let i = 0; i < first; i++) calDays.push({ d: new Date(year, month, -first + i + 1).getDate(), type: "other" });
  for (let d = 1; d <= days; d++) calDays.push({ d, type: d === t.getDate() && month === t.getMonth() && year === t.getFullYear() ? "today" : "normal" });
  const trail = 7 - ((first + days) % 7 || 7);
  for (let d = 1; d <= trail && trail < 7; d++) calDays.push({ d, type: "other" });

  return (
    <div>
      {/* STAT CARDS */}
      <div className="stats-row">
        {[
          { icon: "👤", label: "Total de Pacientes",   value: stats.totalPacientes },
          { icon: "✅", label: "Pacientes Ativos",     value: stats.pacientesAtivos },
          { icon: "👥", label: "Profissionais Ativos", value: stats.totalUsuarios },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* DASH GRID */}
      <div className="dash-grid">
        {/* CALENDAR */}
        <div className="card">
          <div className="cal-header">
            <div className="cal-title">Calendário</div>
            <div className="cal-nav">
              <button className="cal-btn" onClick={() => setCalDate(new Date(year, month - 1, 1))}>‹</button>
              <span className="cal-month">{MESES[month]} {year}</span>
              <button className="cal-btn" onClick={() => setCalDate(new Date(year, month + 1, 1))}>›</button>
            </div>
          </div>
          <div className="cal-divider" />
          <div className="cal-grid">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => <div key={d} className="cal-dow">{d}</div>)}
            {calDays.map((c, i) => (
              <div key={i} className={`cal-day${c.type === "today" ? " cal-today" : c.type === "other" ? " cal-other" : ""}`}>{c.d}</div>
            ))}
          </div>
        </div>

        {/* CONSULTAS HOJE */}
        <div className="card">
          <div className="cd-header">
            <div className="cd-title">Consultas Hoje</div>
            <div className="cd-count">{stats.consultasHoje}</div>
          </div>
          <div className="cd-divider" />
          {hoje.length === 0
            ? <div className="cd-empty">Nenhuma consulta hoje.</div>
            : hoje.map((c, i) => (
              <div key={i} className="slot">
                <span className="slot-time">{c.hora}</span>
                <span className="slot-chip" onClick={() => router.push(`/pacientes/${c.paciente_id}`)}>{c.paciente_nome}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
