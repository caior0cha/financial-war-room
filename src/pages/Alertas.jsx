import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Check } from 'lucide-react';
import { alertas as initialAlertas } from '../data/mockData';
import { alertTypeStyle } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';

const TIPO_ICONS = {
  danger:  XCircle,
  warning: AlertTriangle,
  info:    Info,
  success: CheckCircle,
};

const TIPO_LABELS = { danger: 'Crítico', warning: 'Atenção', info: 'Info', success: 'Sucesso' };

export default function AlertasPage({ onMobileMenu }) {
  const [alertas, setAlertas] = useState(initialAlertas);
  const [filter, setFilter]   = useState('todos');

  const marcarLido = (id) => setAlertas(a => a.map(x => x.id === id ? { ...x, lido: true } : x));
  const marcarTodos = () => setAlertas(a => a.map(x => ({ ...x, lido: true })));

  const filtered = alertas.filter(a => {
    if (filter === 'nao_lidos') return !a.lido;
    if (filter === 'lidos')     return a.lido;
    if (['danger','warning','info','success'].includes(filter)) return a.tipo === filter;
    return true;
  });

  const unread = alertas.filter(a => !a.lido).length;

  const summary = [
    { tipo: 'danger',  label: 'Críticos',  count: alertas.filter(a=>a.tipo==='danger').length },
    { tipo: 'warning', label: 'Atenção',   count: alertas.filter(a=>a.tipo==='warning').length },
    { tipo: 'info',    label: 'Info',      count: alertas.filter(a=>a.tipo==='info').length },
    { tipo: 'success', label: 'Sucesso',   count: alertas.filter(a=>a.tipo==='success').length },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="Alertas" subtitle="Notificações e avisos do sistema" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summary.map(s => {
            const style = alertTypeStyle(s.tipo);
            const Icon  = TIPO_ICONS[s.tipo];
            return (
              <button key={s.tipo} onClick={() => setFilter(filter === s.tipo ? 'todos' : s.tipo)}
                className={`rounded-lg p-4 border text-left transition-all ${style.bg} ${style.border}
                  ${filter === s.tipo ? 'ring-1 ring-offset-0 ring-current' : 'hover:opacity-80'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={style.text} />
                  <span className={`text-xs uppercase tracking-widest font-display ${style.text}`}>{s.label}</span>
                </div>
                <p className="text-white text-2xl mono font-bold">{s.count}</p>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1">
            {[
              { key: 'todos', label: `Todos (${alertas.length})` },
              { key: 'nao_lidos', label: `Não lidos (${unread})` },
              { key: 'lidos', label: 'Lidos' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${filter === f.key ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-600 hover:text-slate-900 hover:bg-white/[0.07]'}`}>
                {f.label}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={marcarTodos}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-sm text-slate-700 hover:text-slate-900 transition-all">
              <Check size={12} />
              Marcar todos como lido
            </button>
          )}
        </div>

        {/* Alert list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-gray-600 py-12">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum alerta nesta categoria</p>
            </div>
          )}
          {filtered.map(a => {
            const style = alertTypeStyle(a.tipo);
            const Icon  = TIPO_ICONS[a.tipo];
            return (
              <div key={a.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all
                  ${a.lido ? 'opacity-60' : ''} ${style.bg} ${style.border}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg}`}>
                  <Icon size={16} className={style.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-widest font-display ${style.text}`}>
                      {TIPO_LABELS[a.tipo]}
                    </span>
                    {!a.lido && <span className={`w-1.5 h-1.5 rounded-full alert-dot ${style.bar}`} />}
                  </div>
                  <p className="text-white text-sm font-medium mb-1">{a.titulo}</p>
                  <p className="text-slate-600 text-sm">{a.msg}</p>
                  <p className="text-slate-600 text-xs mono mt-2">{a.data}</p>
                </div>
                {!a.lido && (
                  <button onClick={() => marcarLido(a.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] text-slate-700 hover:text-slate-900 transition-all">
                    <Check size={11} />
                    Lido
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
