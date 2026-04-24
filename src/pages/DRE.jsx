import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { dreAnual, monthlyRevenue } from '../data/mockData';
import { fmt, exportCSV } from '../utils/helpers';
import { KPICard, SectionHeader, Card, Divider } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';

const CTooltip = ({ active, payload, label }) => {
  const validPayload = (payload || []).filter(p => p?.value !== null && p?.value !== undefined);
  if (!active || !validPayload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs mono shadow-xl">
      <p className="text-slate-600 mb-2">{label}</p>
      {validPayload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || '#F59E0B' }} />
          <span className="text-slate-700">{p.name}:</span>
          <span className="text-slate-900">{typeof p.value === 'number' ? (p.value > 100 ? fmt.currency(p.value, true) : p.value.toFixed(1) + '%') : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const d = dreAnual;

// DRE line items
const dreLines = [
  { label: 'Receita Bruta',         value: d.receitaBruta,         tipo: 'receita', nivel: 0 },
  { label: '(-) Deduções',          value: -d.deducoes,            tipo: 'deducao', nivel: 1 },
  { label: '= Receita Líquida',     value: d.receitaLiquida,       tipo: 'subtotal',nivel: 0 },
  { label: '(-) Custo das Vendas',  value: -d.cogs,                tipo: 'deducao', nivel: 1 },
  { label: '= Lucro Bruto',         value: d.lucroBruto,           tipo: 'subtotal',nivel: 0 },
  { label: '(-) Desp. Comerciais',  value: -d.despesasComerciais,  tipo: 'deducao', nivel: 1 },
  { label: '(-) Desp. Administrativas', value: -d.despesasAdmin,   tipo: 'deducao', nivel: 1 },
  { label: '(-) Desp. Financeiras', value: -d.despesasFinanceiras, tipo: 'deducao', nivel: 1 },
  { label: '(+) Outras Receitas',   value: d.outrasReceitas,       tipo: 'adicao',  nivel: 1 },
  { label: '= EBIT',                value: d.ebit,                 tipo: 'subtotal',nivel: 0 },
  { label: '(-) IR / CSLL',         value: -d.ir,                  tipo: 'deducao', nivel: 1 },
  { label: '= Lucro Líquido',       value: d.lucroLiquido,         tipo: 'resultado',nivel: 0 },
];

// Waterfall data
const waterfallData = [
  { name: 'Rec. Bruta',  value: d.receitaBruta,        base: 0,             fill: '#F59E0B' },
  { name: 'Deduções',    value: d.deducoes,             base: d.receitaLiquida, fill: '#EF4444' },
  { name: 'Rec. Líq.',   value: d.receitaLiquida,       base: 0,             fill: '#F59E0B', is_total: true },
  { name: 'COGS',        value: d.cogs,                 base: d.lucroBruto,  fill: '#EF4444' },
  { name: 'Lucro Bruto', value: d.lucroBruto,           base: 0,             fill: '#10B981', is_total: true },
  { name: 'Desp. Op.',   value: d.despesasComerciais + d.despesasAdmin, base: d.ebit + d.despesasFinanceiras - d.outrasReceitas, fill: '#EF4444' },
  { name: 'EBIT',        value: d.ebit,                 base: 0,             fill: '#10B981', is_total: true },
  { name: 'IR/CSLL',     value: d.ir,                   base: d.lucroLiquido,fill: '#EF4444' },
  { name: 'Lucro Líq.',  value: d.lucroLiquido,         base: 0,             fill: '#10B981', is_total: true },
];

// Margem trend
const margemTrend = monthlyRevenue.slice(-12).map(m => ({
  mes: m.mes,
  margem: m.margem,
  ebitda: parseFloat(((m.ebitda / m.receita) * 100).toFixed(1)),
  bruta: parseFloat((((m.receita - m.custoVenda) / m.receita) * 100).toFixed(1)),
}));

export default function DREPage({ onMobileMenu }) {
  const margLiq   = ((d.lucroLiquido / d.receitaLiquida) * 100).toFixed(1);
  const margBruta = ((d.lucroBruto / d.receitaLiquida) * 100).toFixed(1);
  const margEbit  = ((d.ebit / d.receitaLiquida) * 100).toFixed(1);

  const handleExport = () => exportCSV(dreLines.map(l => ({ item: l.label, valor: l.value, percentualRL: ((l.value / d.receitaLiquida) * 100).toFixed(1) })), 'dre_anual');

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="DRE" subtitle="Demonstrativo de Resultado do Exercício — Ano corrente" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Receita Líquida" value={d.receitaLiquida} format="currency" icon={TrendingUp} accent />
          <KPICard label="Lucro Bruto" value={d.lucroBruto} format="currency" icon={DollarSign} />
          <KPICard label="EBIT" value={d.ebit} format="currency" icon={BarChart3} />
          <KPICard label="Lucro Líquido" value={d.lucroLiquido} format="currency" icon={DollarSign} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Margem Bruta',   value: margBruta, color: 'text-amber-400' },
            { label: 'Margem EBIT',    value: margEbit,  color: 'text-blue-400' },
            { label: 'Margem Líquida', value: margLiq,   color: 'text-emerald-400' },
          ].map(m => (
            <div key={m.label} className="rounded-lg p-4 border border-white/[0.07] bg-white/[0.03] text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-display mb-2">{m.label}</p>
              <p className={`mono text-3xl font-bold ${m.color}`}>{m.value}%</p>
            </div>
          ))}
        </div>

        {/* DRE table + waterfall */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* DRE Analítico */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">DRE Analítico</h2>
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded text-sm text-slate-700 hover:text-slate-900 transition-all">
                CSV
              </button>
            </div>
            <div className="space-y-0.5">
              {dreLines.map((l, i) => {
                const pct = ((Math.abs(l.value) / d.receitaLiquida) * 100).toFixed(1);
                const isTotal = l.tipo === 'subtotal' || l.tipo === 'resultado';
                const isResult = l.tipo === 'resultado';
                return (
                  <div key={i}
                    className={`flex items-center justify-between px-3 py-2 rounded
                      ${isResult ? 'bg-emerald-500/10 border border-emerald-500/20 mt-2' : isTotal ? 'bg-white/[0.04] border border-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                  >
                    <span className={`text-sm ${l.nivel === 1 ? 'pl-4 text-slate-600' : 'text-slate-800 font-medium'} ${isResult ? 'text-emerald-600 font-semibold' : ''}`}>
                      {l.label}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs mono w-14 text-right">{pct}%</span>
                      <span className={`mono text-sm font-medium w-32 text-right
                        ${l.value < 0 ? 'text-red-500' : isResult ? 'text-emerald-600' : isTotal ? 'text-amber-500' : 'text-slate-800'}`}>
                        {fmt.currency(l.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Waterfall chart */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Cascata de Resultado" />
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={waterfallData} margin={{ top: 5, right: 5, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} width={72} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const item = waterfallData.find(d => d.name === label);
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs mono shadow-xl">
                        <p className="text-slate-900 font-medium mb-1">{label}</p>
                        <p className="text-slate-700">{fmt.currency(item?.value ?? 0)}</p>
                      </div>
                    );
                  }}
                />
                {/* Transparent base bar */}
                <Bar dataKey="base" fill="transparent" stackId="w" />
                <Bar dataKey="value" stackId="w" radius={[3,3,0,0]}>
                  {waterfallData.map((e, i) => (
                    <Cell key={i} fill={e.fill} fillOpacity={e.is_total ? 1 : 0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margem trend */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          <SectionHeader title="Evolução das Margens — 12 meses" />
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={margemTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={46} />
              <Tooltip content={<CTooltip />} />
              <ReferenceLine y={15} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 3" label={{ value: 'Meta 15%', fill: '#F59E0B', fontSize: 9 }} />
              <Line type="monotone" dataKey="bruta"  name="Mg. Bruta"  stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ebitda" name="EBITDA%"    stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="margem" name="Mg. Líquida"stroke="#10B981" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </main>
    </div>
  );
}
