import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, Award } from 'lucide-react';
import { pedidosVenda, monthlyRevenue, vendasPorVendedor, vendasSegmento } from '../data/mockData';
import { fmt, exportCSV, filterRows, paginate, statusColor } from '../utils/helpers';
import { KPICard, SectionHeader, Badge, Toolbar, DataTable, Progress } from '../components/ui/index';
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
          <span className="text-slate-900">{typeof p.value === 'number' && p.value > 1000 ? fmt.currency(p.value, true) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const COLS = [
  { key: 'id',        label: 'Nº Pedido',  render: v => <span className="mono text-amber-400">{v}</span> },
  { key: 'data',      label: 'Data',        render: v => <span className="mono text-gray-400">{v}</span> },
  { key: 'cliente',   label: 'Cliente' },
  { key: 'produto',   label: 'Produto',     render: v => <span className="text-gray-400">{v}</span> },
  { key: 'vendedor',  label: 'Vendedor',    render: v => <span className="text-blue-400">{v}</span> },
  { key: 'valor',     label: 'Valor',       render: v => <span className="mono text-white font-medium">{fmt.currency(v)}</span> },
  { key: 'formaPgto', label: 'Pagamento',   render: v => <span className="text-gray-400">{v}</span> },
  { key: 'status',    label: 'Status',      render: v => <Badge status={v} /> },
];

const STATUS_OPTS = ['Todos', 'Pago', 'Pendente', 'Em aberto', 'Cancelado'];
const VENDEDOR_OPTS = ['Todos', 'Ana Costa', 'Bruno Lima', 'Carla Dias', 'Diego Matos', 'Elena Souza'];

export default function VendasPage({ onMobileMenu }) {
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('Todos');
  const [vendedorF, setVendedorF] = useState('Todos');
  const [page, setPage]           = useState(1);
  const perPage = 15;

  const filtered = useMemo(() => {
    let rows = pedidosVenda;
    if (statusF !== 'Todos')   rows = rows.filter(r => r.status === statusF);
    if (vendedorF !== 'Todos') rows = rows.filter(r => r.vendedor === vendedorF);
    return filterRows(rows, search, ['id', 'cliente', 'produto', 'vendedor']);
  }, [search, statusF, vendedorF]);

  const pageRows = paginate(filtered, page, perPage);

  // KPIs
  const totalVendas  = pedidosVenda.reduce((a, b) => a + b.valor, 0);
  const totalPago    = pedidosVenda.filter(p => p.status === 'Pago').reduce((a, b) => a + b.valor, 0);
  const ticketMedio  = totalVendas / pedidosVenda.length;
  const taxaConv     = ((pedidosVenda.filter(p => p.status === 'Pago').length / pedidosVenda.length) * 100).toFixed(1);

  // Monthly revenue chart
  const monthData = monthlyRevenue.slice(-12);

  // Status distribution
  const statusDist = STATUS_OPTS.slice(1).map(s => ({
    name: s,
    qty: pedidosVenda.filter(p => p.status === s).length,
    valor: pedidosVenda.filter(p => p.status === s).reduce((a, b) => a + b.valor, 0),
  }));
  const statusColors = { 'Pago': '#10B981', 'Pendente': '#F59E0B', 'Em aberto': '#F97316', 'Cancelado': '#EF4444' };

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="Vendas" subtitle="Pedidos, clientes e performance comercial" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Receita Total" value={totalVendas} format="currency" icon={TrendingUp} accent />
          <KPICard label="Recebido" value={totalPago} format="currency" icon={ShoppingBag} />
          <KPICard label="Ticket Médio" value={ticketMedio} format="currency" icon={Award} />
          <div className="rounded-lg p-4 border bg-white/[0.03] border-white/[0.07]">
            <p className="text-gray-400 text-[11px] uppercase tracking-widest font-display mb-3">Taxa Conversão</p>
            <p className="mono text-white text-2xl font-semibold">{taxaConv}%</p>
            <p className="text-gray-500 text-xs mono mt-2">{pedidosVenda.filter(p=>p.status==='Pago').length} de {pedidosVenda.length} pedidos</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue trend */}
          <div className="lg:col-span-2 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Receita Mensal — 12 meses" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} width={62} />
                <Tooltip content={<CTooltip />} />
                <Bar dataKey="receita" name="Receita" fill="#F59E0B" radius={[3,3,0,0]} opacity={0.85} />
                <Bar dataKey="lucroLiq" name="Lucro Líq." fill="#10B981" radius={[3,3,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribuição */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Status dos Pedidos" />
            <div className="space-y-3 mt-2">
              {statusDist.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-medium">{s.name}</span>
                    <div className="flex gap-3">
                      <span className="text-slate-600 mono">{s.qty} pedidos</span>
                      <span className="text-slate-900 mono font-medium">{fmt.currency(s.valor, true)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(s.qty / pedidosVenda.length) * 100}%`, background: statusColors[s.name] }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.07] mt-4 pt-4">
              <SectionHeader title="Performance Vendedores" />
              <div className="space-y-2.5">
                {vendasPorVendedor.map(v => {
                  const pct = (v.realizado / v.meta) * 100;
                  return (
                    <div key={v.nome}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 truncate max-w-[100px]">{v.nome.split(' ')[0]}</span>
                        <span className={`mono font-semibold ${pct>=100?'text-emerald-400':'text-amber-400'}`}>{pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={v.realizado} max={v.meta * 1.1} color={pct >= 100 ? 'emerald' : 'amber'} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">
              Pedidos de Venda
              <span className="ml-2 text-gray-500 text-xs normal-case mono">({filtered.length} registros)</span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Toolbar
              search={search} setSearch={v => { setSearch(v); setPage(1); }}
              placeholder="Buscar por cliente, produto, pedido…"
              onExport={() => exportCSV(filtered, 'pedidos_venda')}
              extraFilters={
                <>
                  <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-500/40 transition-all">
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={vendedorF} onChange={e => { setVendedorF(e.target.value); setPage(1); }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-500/40 transition-all">
                    {VENDEDOR_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </>
              }
            />
          </div>

          <DataTable
            columns={COLS}
            rows={pageRows}
            page={page}
            setPage={v => setPage(v)}
            perPage={perPage}
            total={filtered.length}
            filename="pedidos_venda"
          />
        </div>

      </main>
    </div>
  );
}
