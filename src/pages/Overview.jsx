import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
  TrendingUp, DollarSign, BarChart3, Users,
  AlertTriangle, Activity, PieChart, Briefcase
} from 'lucide-react';
import {
  kpis, monthlyRevenue, vendasSegmento, vendasPorVendedor,
  contasReceber, alertas, forecast, despesasCentro
} from '../data/mockData';
import { fmt, deltaColor } from '../utils/helpers';
import { KPICard, SectionHeader, Card, Badge, Progress, Divider, alertTypeStyle } from '../components/ui/index';
import Topbar from '../components/layout/Topbar';

const COLORS = { amber: '#F59E0B', emerald: '#10B981', blue: '#3B82F6', red: '#EF4444', violet: '#8B5CF6' };

const CustomTooltip = ({ active, payload, label, currency = true }) => {
  const validPayload = (payload || []).filter(p => p?.value !== null && p?.value !== undefined);
  if (!active || !validPayload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xl text-xs mono">
      <p className="text-slate-600 mb-2">{label}</p>
      {validPayload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-700">{p.name}:</span>
          <span className="text-slate-900 font-medium">
            {currency ? fmt.currency(p.value, true) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Revenue area chart
function RevenueChart() {
  const data = monthlyRevenue.slice(-12);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 12 }}>
        <defs>
          <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => fmt.currency(v, true)}
          width={70}
          tickMargin={8}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="receita" name="Receita" stroke="#F59E0B" strokeWidth={2} fill="url(#recGrad)" dot={false} />
        <Area type="monotone" dataKey="lucroLiq" name="Lucro Líq." stroke="#10B981" strokeWidth={2} fill="url(#lucroGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Donut-like segmento chart
function SegmentoChart() {
  return (
    <div className="space-y-2.5">
      {vendasSegmento.map(s => (
        <div key={s.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{s.name}</span>
            <span className="mono text-slate-900 font-medium">{s.value}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, background: s.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Vendedores performance
function VendedoresChart() {
  return (
    <div className="space-y-3">
      {vendasPorVendedor.map(v => {
        const pct = (v.realizado / v.meta) * 100;
        const over = pct >= 100;
        return (
          <div key={v.nome}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-700">{v.nome}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-600">{fmt.currency(v.realizado, true)}</span>
                <span className={`mono font-semibold ${over ? 'text-emerald-400' : 'text-amber-400'}`}>{pct.toFixed(0)}%</span>
              </div>
            </div>
            <Progress value={v.realizado} max={v.meta * 1.2} color={over ? 'emerald' : 'amber'} />
          </div>
        );
      })}
    </div>
  );
}

// Forecast chart
function ForecastChart() {
  const combined = [
    ...monthlyRevenue.slice(-3).map(m => ({ mes: m.mes, realizado: m.receita, projetada: null, otimista: null, pessimista: null })),
    ...forecast.map(f => ({ mes: f.mes, realizado: null, projetada: f.receitaProjetada, otimista: f.receitaOtimista, pessimista: f.receitaPessimista })),
  ];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={combined} margin={{ top: 8, right: 8, left: 8, bottom: 12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="mes"
          type="category"
          interval={0}
          minTickGap={0}
          padding={{ left: 8, right: 8 }}
          tick={{ fontSize: 10, fill: '#475569', fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} width={70} tickMargin={8} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={monthlyRevenue.slice(-3)[2].mes} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="realizado"  name="Realizado" stroke="#F59E0B" strokeWidth={2} dot={false} connectNulls={false} />
        <Line type="monotone" dataKey="projetada"  name="Projetado" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} />
        <Line type="monotone" dataKey="otimista"   name="Otimista"  stroke="#10B981" strokeWidth={1} strokeDasharray="2 3" dot={false} connectNulls={false} />
        <Line type="monotone" dataKey="pessimista" name="Pessimista"stroke="#EF4444" strokeWidth={1} strokeDasharray="2 3" dot={false} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Despesas por centro
function DespesasChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={despesasCentro} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => fmt.currency(v, true)} width={62} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#475569' }} />
        <Bar dataKey="RH"         name="RH"         stackId="a" fill="#8B5CF6" />
        <Bar dataKey="Operações"  name="Operações"  stackId="a" fill="#3B82F6" />
        <Bar dataKey="Comercial"  name="Comercial"  stackId="a" fill="#F59E0B" />
        <Bar dataKey="TI"         name="TI"         stackId="a" fill="#10B981" />
        <Bar dataKey="Marketing"  name="Marketing"  stackId="a" fill="#F97316" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Contas a receber aging
function AgingBars({ data }) {
  const total = data.reduce((a, b) => a + b.valor, 0);
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.faixa}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{d.faixa}</span>
            <div className="flex gap-3">
              <span className="mono text-slate-600">{d.qtd} títulos</span>
              <span className="mono text-slate-900 font-medium">{fmt.currency(d.valor, true)}</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(d.valor / total) * 100}%`, background: d.cor }} />
          </div>
        </div>
      ))}
      <div className="flex justify-between text-xs pt-1 border-t border-white/[0.07]">
        <span className="text-gray-500 font-display uppercase tracking-wider">Total</span>
        <span className="mono text-amber-400 font-semibold">{fmt.currency(total)}</span>
      </div>
    </div>
  );
}

export default function Overview({ onMobileMenu }) {
  const unread = alertas.filter(a => !a.lido).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-surface-950 light:bg-surface-50">
      <Topbar title="Visão Geral" subtitle="Painel executivo — dados do período atual" onMobileMenu={onMobileMenu} />

      <main className="flex-1 p-4 md:p-6 space-y-5 animate-page">

        {/* ── KPIs row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Receita Líq." value={kpis.receita.value} delta={kpis.receita.delta} format="currency" icon={TrendingUp} accent deltaClassName="text-xs font-semibold" />
          <KPICard label="Lucro Líquido" value={kpis.lucroLiq.value} delta={kpis.lucroLiq.delta} format="currency" icon={DollarSign} deltaClassName="text-xs font-semibold" />
          <KPICard label="EBITDA" value={kpis.ebitda.value} delta={kpis.ebitda.delta} format="currency" icon={BarChart3} deltaClassName="text-xs font-semibold" />
          <KPICard label="Margem Líq." value={kpis.margem.value} delta={kpis.margem.delta} format="pct" icon={Activity} deltaClassName="text-xs font-semibold" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Saldo Caixa" value={kpis.saldoCaixa.value} delta={kpis.saldoCaixa.delta} format="currency" icon={DollarSign} deltaClassName="text-xs font-semibold" />
          <KPICard label="Inadimplência" value={kpis.inadimplencia.value} delta={kpis.inadimplencia.delta} format="pct" icon={AlertTriangle} deltaClassName="text-xs font-semibold" />
          <KPICard label="Ticket Médio" value={kpis.ticketMedio.value} delta={kpis.ticketMedio.delta} format="currency" icon={Briefcase} deltaClassName="text-xs font-semibold" />
          <KPICard label="Colaboradores" value={kpis.colaboradores.value} delta={kpis.colaboradores.delta} format="number" icon={Users} deltaClassName="text-xs font-semibold" />
        </div>

        {/* ── Main charts row ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Receita & Lucro — 12 meses" />
            <RevenueChart />
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Mix de Vendas" />
            <SegmentoChart />
            <Divider />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-600 mb-0.5">Maior segmento</p>
                <p className="text-white font-semibold">Corporativo 38%</p>
              </div>
              <div>
                <p className="text-slate-600 mb-0.5">Clientes ativos</p>
                <p className="text-white font-semibold">247 / 300</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Second row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Performance Vendedores" />
            <VendedoresChart />
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Forecast 6 meses" />
            <ForecastChart />
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Contas a Receber — Aging" />
            <AgingBars data={contasReceber} />
          </div>
        </div>

        {/* ── Despesas + Alertas ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Despesas por Centro de Custo — 6 meses" />
            <DespesasChart />
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <SectionHeader title="Alertas Recentes">
              <span className="text-xs text-slate-600 mono">{alertas.filter(a=>!a.lido).length} não lidos</span>
            </SectionHeader>
            <div className="space-y-2">
              {alertas.slice(0, 5).map(a => {
                const s = alertTypeStyle(a.tipo);
                return (
                  <div key={a.id} className={`flex gap-2.5 p-2.5 rounded-md border ${s.bg} ${s.border}`}>
                    <div className={`w-0.5 rounded-full flex-shrink-0 ${s.bar}`} />
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold ${s.text} truncate`}>{a.titulo}</p>
                      <p className="text-slate-600 text-xs truncate mt-0.5">{a.msg}</p>
                    </div>
                    {!a.lido && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 alert-dot ${s.bar}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
