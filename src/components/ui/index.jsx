import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { fmt, deltaColor, statusColor, exportCSV } from '../../utils/helpers';

// ── KPI Card ──────────────────────────────────────────────────────
export function KPICard({ label, value, delta, prefix = '', suffix = '', format = 'currency', icon: Icon, accent = false, deltaClassName = '' }) {
  const display = format === 'currency' ? fmt.currency(value, true)
                : format === 'pct'      ? `${value.toFixed(1)}%`
                : format === 'number'   ? fmt.number(value)
                : `${prefix}${value}${suffix}`;

  const positive = delta > 0;
  const negative = delta < 0;
  const DeltaIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;

  return (
    <div className={`relative rounded-lg p-4 border transition-all duration-200
      ${accent
        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
        : 'bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-400 text-[11px] uppercase tracking-widest font-display">{label}</span>
        {Icon && <Icon size={14} className={accent ? 'text-amber-400' : 'text-gray-600'} />}
      </div>

      <div className="mono text-white text-2xl font-semibold leading-none mb-2">
        {display}
      </div>

      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] mono ${deltaColor(delta)} ${deltaClassName}`}>
          <DeltaIcon size={11} />
          <span>{Math.abs(delta).toFixed(1)}% vs mês anterior</span>
        </div>
      )}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────
export function SectionHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">{title}</h2>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg border border-white/[0.07] bg-white/[0.03] dark:bg-white/[0.03] p-4 ${className}`}>
      {children}
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────
export function Badge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium mono ${statusColor(status)}`}>
      {status}
    </span>
  );
}

// ── Data Table ───────────────────────────────────────────────────
export function DataTable({
  columns, rows, filename, searchFields = [],
  page, setPage, perPage = 15, total,
}) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-white/[0.07]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              {columns.map(col => (
                <th key={col.key}
                  className="text-left px-3 py-2.5 text-gray-600 font-display uppercase tracking-widest text-[11px] whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}
                className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center text-gray-600 py-8 text-sm">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-xs mono">
          {total} registros — pág. {page}/{totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-slate-900 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs mono transition-all
                  ${p === page ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-gray-600 hover:text-slate-900 hover:bg-white/[0.07]'}`}>
                {p}
              </button>
            );
          })}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-slate-900 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toolbar (search + export) ─────────────────────────────────────
export function Toolbar({ search, setSearch, placeholder, onExport, extraFilters }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={placeholder || 'Buscar…'}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-gray-500 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all"
        />
      </div>
      {extraFilters}
      {onExport && (
        <button onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md text-sm text-slate-700 hover:text-slate-900 transition-all">
          <Download size={12} />
          <span>CSV</span>
        </button>
      )}
    </div>
  );
}

// ── Progress bar ────────────────────────────────────────────────
export function Progress({ value, max, color = 'amber' }) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = { amber: 'bg-amber-500', emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500' };
  return (
    <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${colors[color]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────
export function Divider() {
  return <div className="border-t border-white/[0.06] my-4" />;
}

// ── Alert type colors ────────────────────────────────────────────
export function alertTypeStyle(tipo) {
  return {
    danger:  { bar: 'bg-red-500',     text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
    warning: { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
    info:    { bar: 'bg-blue-500',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
    success: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  }[tipo];
}
