"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalPacientes:0, pacientesAtivos:0, totalUsuarios:0, consultasHoje:0 });
  const [hoje, setHoje]   = useState<{hora:string;paciente_nome:string;paciente_id:number}[]>([]);
  const [cal, setCal]     = useState(new Date());

  const load = useCallback(async () => {
    const [s, h] = await Promise.all([
      fetch("/api/dashboard/stats").then(r=>r.json()),
      fetch("/api/consultas/hoje").then(r=>r.json()),
    ]);
    if (s.error) { router.push("/login"); return; }
    setStats(s);
    setHoje(Array.isArray(h) ? h : []);
  }, [router]);

  useEffect(()=>{ load(); },[load]);

  const year = cal.getFullYear(), month = cal.getMonth();
  const first = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const today = new Date();
  type DayCell = {d:number;type:"prev"|"curr"|"next"};
  const cells: DayCell[] = [];
  for (let i=0;i<first;i++) cells.push({d:new Date(year,month,-first+i+1).getDate(),type:"prev"});
  for (let d=1;d<=daysInMonth;d++) cells.push({d,type:"curr"});
  const trail = 7-((first+daysInMonth)%7||7);
  for (let d=1;d<=trail&&trail<7;d++) cells.push({d,type:"next"});

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
              const isToday = c.type==="curr" && c.d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
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
            <span className="cd-title">Consultas do dia</span>
            <span className="cd-count">{String(stats.consultasHoje).padStart(2,"0")}</span>
          </div>
          <div className="cd-divider"/>
          {hoje.length===0
            ? <div className="cd-empty">Nenhuma consulta hoje.</div>
            : hoje.map((c,i)=>(
              <div key={i} className="cd-slot">
                <span className="cd-time">{c.hora}</span>
                <button className="cd-chip" onClick={()=>router.push(`/pacientes/${c.paciente_id}`)}>
                  {c.paciente_nome.split(" ")[0]} {c.paciente_nome.split(" ").slice(-1)[0]}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
