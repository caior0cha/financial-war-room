import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ShoppingCart, Package, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { pedidosCompra } from '../data/mockData';
import { fmt, exportCSV, filterRows, paginate } from '../utils/helpers';
import { KPICard, SectionHeader, Badge, Toolbar, DataTable } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';

const CTooltip = ({ active, payload, label }) => {
  const validPayload = (payload || []).filter(p => p?.value !== null && p?.value !== undefined);
  if (!active || !validPayload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs mono shadow-xl">
      <p className="text-slate-600 mb-2">{label}</p>
      {validPayload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-700">{p.name}:</span>
          <span className="text-slate-900">{p.value > 1000 ? fmt.currency(p.value, true) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const COLS = [
  { key: 'id',         label: 'Nº PO',      render: v => <span className="mono text-amber-400">{v}</span> },
  { key: 'data',       label: 'Data',        render: v => <span className="mono text-gray-400">{v}</span> },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'categoria',  label: 'Categoria',   render: v => <span className="text-blue-400">{v}</span> },
  { key: 'centro',     label: 'Centro Custo',render: v => <span className="text-gray-400">{v}</span> },
  { key: 'aprovador',  label: 'Aprovador',   render: v => <span className="text-violet-400">{v}</span> },
  { key: 'valor',      label: 'Valor',       render: v => <span className="mono text-white font-medium">{fmt.currency(v)}</span> },
  { key: 'status',     label: 'Status',      render: v => <Badge status={v} /> },
];

const STATUS_OPTS   = ['Todos', 'Aprovado', 'Pendente', 'Em análise', 'Cancelado'];
const CAT_OPTS      = ['Todas', 'TI/Infra', 'Telecom', 'RH/Benefícios', 'Logística', 'Seguros', 'Equipamentos', 'Marketing', 'Facilities'];
const CAT_COLORS    = ['#F59E0B','#3B82F6','#8B5CF6','#10B981','#F97316','#EF4444','#EC4899','#06B6D4'];

export default function ComprasPage({ onMobileMenu }) {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('Todos');
  const [catF, setCatF]       = useState('Todas');
  const [page, setPage]       = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const perPage = 15;
  const pendingPerPage = 8;

  const filtered = useMemo(() => {
    let rows = pedidosCompra;
    if (statusF !== 'Todos') rows = rows.filter(r => r.status === statusF);
    if (catF !== 'Todas')    rows = rows.filter(r => r.categoria === catF);
    return filterRows(rows, search, ['id', 'fornecedor', 'categoria', 'centro', 'aprovador']);
  }, [search, statusF, catF]);

  const pageRows = paginate(filtered, page, perPage);

  // KPIs
  const totalGasto    = pedidosCompra.reduce((a, b) => a + b.valor, 0);
  const totalAprovado = pedidosCompra.filter(p => p.status === 'Aprovado').reduce((a, b) => a + b.valor, 0);
  const totalPendente = pedidosCompra.filter(p => p.status === 'Pendente' || p.status === 'Em análise').reduce((a, b) => a + b.valor, 0);
  const qtdFornec     = [...new Set(pedidosCompra.map(p => p.fornecedor))].length;

  // Por categoria
  const porCat = CAT_OPTS.slice(1).map((c, i) => ({
    name: c,
    valor: pedidosCompra.filter(p => p.categoria === c).reduce((a, b) => a + b.valor, 0),
    qtd:   pedidosCompra.filter(p => p.categoria === c).length,
    color: CAT_COLORS[i],
  })).sort((a, b) => b.valor - a.valor);

  // Por fornecedor (top 8)
  const fornMap = {};
  pedidosCompra.forEach(p => { fornMap[p.fornecedor] = (fornMap[p.fornecedor] || 0) + p.valor; });
  const topForn = Object.entries(fornMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, valor]) => ({ name, valor }));

  // Pendentes destacados (resumo)
  const pendingRows = pedidosCompra.filter(p => p.status === 'Pendente' || p.status === 'Em análise');
  const pendingTotalPages = Math.max(1, Math.ceil(pendingRows.length / pendingPerPage));
  const safePendingPage = Math.min(pendingPage, pendingTotalPages);
  const pendingStart = (safePendingPage - 1) * pendingPerPage;
  const pendingEnd = Math.min(pendingStart + pendingPerPage, pendingRows.length);
  const pendingPreviewRows = pendingRows.slice(pendingStart, pendingEnd);

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="Compras" subtitle="Purchase orders, fornecedores e gastos" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Total Comprometido" value={totalGasto} format="currency" icon={ShoppingCart} accent />
          <KPICard label="Aprovado" value={totalAprovado} format="currency" icon={CheckCircle} />
          <KPICard label="Pendente Aprovação" value={totalPendente} format="currency" icon={Clock} />
          <div className="rounded-lg p-4 border bg-white/[0.03] border-white/[0.07]">
            <p className="text-gray-400 text-[11px] uppercase tracking-widest font-display mb-3">Fornecedores Ativos</p>
            <p className="mono text-white text-2xl font-semibold">{qtdFornec}</p>
            <p className="text-gray-500 text-xs mono mt-2">{pedidosCompra.length} POs emitidas</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Por categoria */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Gasto por Categoria" />
            <div className="space-y-2.5 mt-2">
              {porCat.map((c, i) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{c.name}</span>
                    <div className="flex gap-3">
                      <span className="text-gray-500 mono">{c.qtd} POs</span>
                      <span className="text-white mono">{fmt.currency(c.valor, true)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.valor / totalGasto) * 100}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top fornecedores */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Top Fornecedores por Gasto" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topForn} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<CTooltip />} />
                <Bar dataKey="valor" name="Gasto" fill="#F59E0B" radius={[0,3,3,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aprovações pendentes highlight */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <SectionHeader title="⚠ Pendentes de Aprovação">
            <span className="text-amber-400 text-sm mono">
              {pendingRows.length === 0 ? '0 de 0 POs' : `${pendingStart + 1}-${pendingEnd} de ${pendingRows.length} POs`}
            </span>
          </SectionHeader>
          <div className="overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.03]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['PO','Data','Fornecedor','Categoria','Valor','Aprovador','Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-gray-600 font-display uppercase tracking-widest text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingPreviewRows.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <td className="px-3 py-2.5 text-amber-400 mono">{r.id}</td>
                    <td className="px-3 py-2.5 text-slate-600 mono">{r.data}</td>
                    <td className="px-3 py-2.5 text-slate-700">{r.fornecedor}</td>
                    <td className="px-3 py-2.5 text-blue-400">{r.categoria}</td>
                    <td className="px-3 py-2.5 text-slate-900 mono font-medium">{fmt.currency(r.valor)}</td>
                    <td className="px-3 py-2.5 text-violet-400">{r.aprovador}</td>
                    <td className="px-3 py-2.5"><Badge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pendingRows.length > pendingPerPage && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-600 mono">
                Página {safePendingPage} de {pendingTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  disabled={safePendingPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                  disabled={safePendingPage === pendingTotalPages}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full table */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">
              Todos os Purchase Orders
              <span className="ml-2 text-gray-500 text-xs normal-case mono">({filtered.length} registros)</span>
            </h2>
          </div>
          <div className="mb-4">
            <Toolbar
              search={search} setSearch={v => { setSearch(v); setPage(1); }}
              placeholder="Buscar por fornecedor, PO, categoria…"
              onExport={() => exportCSV(filtered, 'pedidos_compra')}
              extraFilters={
                <>
                  <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-500/40">
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-500/40">
                    {CAT_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              }
            />
          </div>
          <DataTable columns={COLS} rows={pageRows} page={page} setPage={v => setPage(v)} perPage={perPage} total={filtered.length} />
        </div>

      </main>
    </div>
  );
}
