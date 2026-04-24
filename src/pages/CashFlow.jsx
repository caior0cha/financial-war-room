import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cashFlow, contasReceber, contasPagar, monthlyRevenue } from '../data/mockData';
import { fmt, exportCSV } from '../utils/helpers';
import { SectionHeader, Card, KPICard, Divider, Toolbar } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';
import { CustomTooltip } from '../components/ui';

const CTooltip = ({ active, payload, label }) => {
  const validPayload = (payload || []).filter(p => p?.value !== null && p?.value !== undefined);
  if (!active || !validPayload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xl text-xs mono">
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

export default function CashFlowPage({ onMobileMenu }) {
  const [period, setPeriod] = useState('90');
  const [search, setSearch] = useState('');

  const days = parseInt(period);
  const data = cashFlow.slice(-days);

  const totalEntradas = data.reduce((a, b) => a + b.entradas, 0);
  const totalSaidas   = data.reduce((a, b) => a + b.saidas, 0);
  const saldoAtual    = data[data.length - 1]?.saldo ?? 0;
  const saldoInicial  = data[0]?.saldo ?? 0;
  const variacaoSaldo = saldoAtual - saldoInicial;

  // Monthly view for bar chart
  const monthlyData = monthlyRevenue.slice(-12).map(m => ({
    mes: m.mes,
    entradas: m.receita,
    saidas: m.custoVenda + m.despesasOp,
    resultado: m.lucroLiq,
  }));

  // Aging summary
  const totalReceber = contasReceber.reduce((a, b) => a + b.valor, 0);
  const totalPagar   = contasPagar.reduce((a, b) => a + b.valor, 0);

  // Filtered daily table
  const filtered = data.filter(d =>
    !search || d.dia.includes(search)
  ).slice().reverse();

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <Topbar title="Fluxo de Caixa" subtitle="Entradas, saídas e posição de caixa" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Saldo Atual" value={saldoAtual} format="currency" icon={DollarSign} accent />
          <KPICard label="Total Entradas" value={totalEntradas} format="currency" icon={ArrowUpRight} />
          <KPICard label="Total Saídas" value={totalSaidas} format="currency" icon={ArrowDownRight} />
          <div className={`rounded-lg p-4 border ${variacaoSaldo >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="text-gray-400 text-[11px] uppercase tracking-widest font-display mb-3">Variação período</p>
            <p className={`mono text-2xl font-semibold ${variacaoSaldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt.currency(variacaoSaldo, true)}
            </p>
            <p className="text-gray-500 text-xs mono mt-2">últimos {days} dias</p>
          </div>
        </div>

        {/* Saldo + Entradas/Saidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">Evolução do Saldo</h2>
              <div className="flex gap-1">
                {['30','60','90'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded text-sm mono transition-all ${period === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-600 hover:text-slate-900 hover:bg-white/[0.07] border border-transparent'}`}>
                    {p}d
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                  interval={Math.floor(days / 8)} />
                <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                  tickFormatter={v => fmt.currency(v, true)} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: 'rgba(255,255,255,0.1)' }} />
                <ReferenceLine y={800000} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 3" label={{ value: 'Mín.', fill: '#EF4444', fontSize: 9 }} />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#F59E0B" strokeWidth={2} fill="url(#saldoGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Posição */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4 flex flex-col gap-4">
            <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">Posição Financeira</h2>

            <div className="space-y-3">
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-500 text-xs uppercase tracking-widest font-display mb-1">A Receber (total)</p>
                <p className="text-white text-xl mono font-semibold">{fmt.currency(totalReceber, true)}</p>
                <p className="text-slate-600 text-xs mono mt-1">{contasReceber.reduce((a,b)=>a+b.qtd,0)} títulos em aberto</p>
              </div>
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-xs uppercase tracking-widest font-display mb-1">A Pagar (total)</p>
                <p className="text-white text-xl mono font-semibold">{fmt.currency(totalPagar, true)}</p>
                <p className="text-slate-600 text-xs mono mt-1">{contasPagar.reduce((a,b)=>a+b.qtd,0)} títulos a pagar</p>
              </div>
              <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-500 text-xs uppercase tracking-widest font-display mb-1">Capital de Giro Líq.</p>
                <p className="text-white text-xl mono font-semibold">{fmt.currency(totalReceber - totalPagar, true)}</p>
                <p className="text-slate-600 text-xs mono mt-1">receber − pagar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entradas vs Saídas mensal */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          <SectionHeader title="Entradas vs Saídas — 12 meses" />
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false}
                tickFormatter={v => fmt.currency(v, true)} width={70} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#475569' }} />
              <Bar dataKey="entradas" name="Entradas" fill="rgba(16,185,129,0.6)" radius={[3,3,0,0]} />
              <Bar dataKey="saidas"   name="Saídas"   fill="rgba(239,68,68,0.6)"  radius={[3,3,0,0]} />
              <Line type="monotone" dataKey="resultado" name="Resultado" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Daily table */}
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white text-sm font-semibold font-display tracking-wide uppercase">Movimentações Diárias</h2>
            <Toolbar
              search={search} setSearch={setSearch} placeholder="Buscar por data…"
              onExport={() => exportCSV(filtered, 'fluxo_caixa')}
            />
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/[0.07]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.03]">
                  {['Data','Entradas','Saídas','Resultado','Saldo Acumulado'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-gray-600 font-display uppercase tracking-widest text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map((r, i) => {
                  const resultado = r.entradas - r.saidas;
                  return (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <td className="px-3 py-2.5 text-slate-600 mono">{r.dia}</td>
                      <td className="px-3 py-2.5 text-emerald-400 mono">{fmt.currency(r.entradas)}</td>
                      <td className="px-3 py-2.5 text-red-400 mono">{fmt.currency(r.saidas)}</td>
                      <td className={`px-3 py-2.5 mono font-semibold ${resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {resultado >= 0 ? '+' : ''}{fmt.currency(resultado)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-900 mono">{fmt.currency(r.saldo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 text-xs mono mt-2">Exibindo últimos 30 dias do período selecionado</p>
        </div>

      </main>
    </div>
  );
}
