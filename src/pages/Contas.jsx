import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CreditCard, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { contasReceber, contasPagar, topClientes, pedidosVenda } from '../data/mockData';
import { fmt, exportCSV, filterRows, paginate } from '../utils/helpers';
import { KPICard, SectionHeader, Badge, Toolbar, DataTable, Progress } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';

const REND_COLORS = ['#10B981','#F59E0B','#F97316','#EF4444'];

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
          <span className="text-slate-900">{fmt.currency(p.value, true)}</span>
        </div>
      ))}
    </div>
  );
};

const COLS_CLIENTES = [
  { key: 'id',           label: '#',           render: v => <span className="mono text-gray-600">{v}</span> },
  { key: 'nome',         label: 'Cliente' },
  { key: 'segmento',     label: 'Segmento',    render: v => <span className="text-blue-400">{v}</span> },
  { key: 'receitaAnual', label: 'Receita Anual',render: v => <span className="mono text-white">{fmt.currency(v)}</span> },
  { key: 'pedidos',      label: 'Pedidos',     render: v => <span className="mono text-slate-700 font-medium">{v}</span> },
  { key: 'ticketMedio',  label: 'Ticket Médio',render: v => <span className="mono text-amber-400">{fmt.currency(v)}</span> },
  { key: 'adimplencia',  label: 'Adimplência', render: v => (
    <div className="flex items-center gap-2">
      <Progress value={v} max={100} color={v >= 95 ? 'emerald' : v >= 88 ? 'amber' : 'red'} />
      <span className={`mono text-[10px] w-8 ${v >= 95 ? 'text-emerald-400' : v >= 88 ? 'text-amber-400' : 'text-red-400'}`}>{v}%</span>
    </div>
  )},
  { key: 'status',       label: 'Status',      render: v => <Badge status={v} /> },
];

const COLS_RECEBER = [
  { key: 'id',       label: 'Nº',       render: v => <span className="mono text-amber-400 text-[10px]">{v}</span> },
  { key: 'data',     label: 'Emissão',  render: v => <span className="mono text-gray-400">{v}</span> },
  { key: 'cliente',  label: 'Cliente', render: v => <span className="text-slate-700">{v}</span> },
  { key: 'produto',  label: 'Produto',  render: v => <span className="text-gray-400">{v}</span> },
  { key: 'vencimento',label:'Vencimento',render: v => <span className="mono text-slate-600">{v}</span> },
  { key: 'valor',    label: 'Valor',    render: v => <span className="mono text-white">{fmt.currency(v)}</span> },
  { key: 'status',   label: 'Status',   render: v => <Badge status={v} /> },
];

export default function ContasPage({ onMobileMenu }) {
  const [tab, setTab]           = useState('receber');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const perPage = 15;

  // Contas a receber — pedidos não pagos
  const aReceber = pedidosVenda.filter(p => p.status !== 'Cancelado' && p.status !== 'Pago');
  const aPagar   = pedidosVenda.filter(p => p.status === 'Pendente').slice(0, 40); // mock pagar

  const activeRows = tab === 'receber' ? aReceber : tab === 'pagar' ? aPagar : topClientes;
  const activeCols = tab === 'clientes' ? COLS_CLIENTES : COLS_RECEBER;
  const activeFields = tab === 'clientes' ? ['nome','segmento'] : ['id','cliente','produto'];

  const filtered  = useMemo(() => filterRows(activeRows, search, activeFields), [activeRows, search, tab]);
  const pageRows  = paginate(filtered, page, perPage);

  // KPIs
  const totalReceber = contasReceber.reduce((a, b) => a + b.valor, 0);
  const totalPagar   = contasPagar.reduce((a, b) => a + b.valor, 0);
  const vencidos     = contasReceber.filter(c => c.faixa !== '0-30 dias').reduce((a,b) => a + b.valor, 0);

  // Aging comparison chart
  const agingComp = ['0-30 dias','31-60 dias','61-90 dias','+90 dias'].map((f, i) => ({
    faixa: f,
    receber: contasReceber[i]?.valor ?? 0,
    pagar:   contasPagar[i]?.valor   ?? 0,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="Contas" subtitle="Receber, pagar e carteira de clientes" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="A Receber" value={totalReceber} format="currency" icon={ArrowUpRight} accent />
          <KPICard label="A Pagar" value={totalPagar} format="currency" icon={ArrowDownRight} />
          <KPICard label="Posição Líquida" value={totalReceber - totalPagar} format="currency" icon={CreditCard} />
          <div className="rounded-lg p-4 border bg-red-500/10 border-red-500/20">
            <p className="text-red-400 text-[11px] uppercase tracking-widest font-display mb-3">Vencidos (+30d)</p>
            <p className="mono text-white text-2xl font-semibold">{fmt.currency(vencidos, true)}</p>
            <p className="text-gray-500 text-xs mono mt-2">{((vencidos/totalReceber)*100).toFixed(1)}% da carteira</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Aging Receber */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Aging — A Receber" />
            <div className="space-y-3">
              {contasReceber.map((d, i) => (
                <div key={d.faixa}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: d.cor }}>{d.faixa}</span>
                    <div className="flex gap-3">
                      <span className="mono text-gray-500">{d.qtd} títulos</span>
                      <span className="mono text-white">{fmt.currency(d.valor, true)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.valor/totalReceber)*100}%`, background: d.cor }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-2 border-t border-white/[0.07]">
                <span className="text-gray-500 uppercase tracking-wider font-display text-[10px]">Total</span>
                <span className="mono text-amber-400 font-semibold">{fmt.currency(totalReceber)}</span>
              </div>
            </div>
          </div>

          {/* Aging Pagar */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Aging — A Pagar" />
            <div className="space-y-3">
              {contasPagar.map((d) => (
                <div key={d.faixa}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: d.cor }}>{d.faixa}</span>
                    <div className="flex gap-3">
                      <span className="mono text-gray-500">{d.qtd} títulos</span>
                      <span className="mono text-white">{fmt.currency(d.valor, true)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.valor/totalPagar)*100}%`, background: d.cor }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-2 border-t border-white/[0.07]">
                <span className="text-gray-500 uppercase tracking-wider font-display text-[10px]">Total</span>
                <span className="mono text-red-400 font-semibold">{fmt.currency(totalPagar)}</span>
              </div>
            </div>
          </div>

          {/* Aging comparison */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Receber vs Pagar" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agingComp} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="faixa" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} width={62} />
                <Tooltip content={<CTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#475569' }} />
                <Bar dataKey="receber" name="A Receber" fill="#10B981" radius={[3,3,0,0]} opacity={0.8} />
                <Bar dataKey="pagar"   name="A Pagar"   fill="#EF4444" radius={[3,3,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabbed table */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-white/[0.07] pb-3">
            {[
              { key: 'receber',  label: `A Receber (${aReceber.length})` },
              { key: 'pagar',    label: `A Pagar (${aPagar.length})` },
              { key: 'clientes', label: `Carteira Clientes (${topClientes.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setPage(1); setSearch(''); }}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all
                  ${tab === t.key ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-600 hover:text-slate-900 hover:bg-white/[0.07]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <Toolbar
              search={search} setSearch={v => { setSearch(v); setPage(1); }}
              placeholder="Buscar…"
              onExport={() => exportCSV(filtered, `contas_${tab}`)}
            />
          </div>

          <DataTable
            columns={activeCols}
            rows={pageRows}
            page={page}
            setPage={setPage}
            perPage={perPage}
            total={filtered.length}
          />
        </div>

      </main>
    </div>
  );
}
