import { subDays, subMonths, format, startOfMonth, eachMonthOfInterval } from 'date-fns';

const rnd = (min, max, decimals = 0) => {
  const v = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.round(v);
};

const fmtMonth = (d) => format(d, 'MMM/yy');

// ── 24 months timeline ──────────────────────────────────────────
const months = eachMonthOfInterval({
  start: subMonths(new Date(), 23),
  end: new Date(),
});

export const monthlyRevenue = months.map((m, i) => {
  const base = 4_200_000;
  const trend = i * 48_000;
  const seasonal = Math.sin((i / 12) * Math.PI * 2) * 380_000;
  const receita = base + trend + seasonal + rnd(-120_000, 120_000);
  const custoVenda = receita * rnd(0.38, 0.44, 2);
  const despOp = receita * rnd(0.22, 0.28, 2);
  const lucroLiq = receita - custoVenda - despOp;
  return {
    mes: fmtMonth(m),
    date: m,
    receita: Math.round(receita),
    custoVenda: Math.round(custoVenda),
    despesasOp: Math.round(despOp),
    lucroLiq: Math.round(lucroLiq),
    margem: parseFloat(((lucroLiq / receita) * 100).toFixed(1)),
    ebitda: Math.round(lucroLiq + receita * 0.04),
  };
});

// ── Cash flow daily (90 days) ────────────────────────────────────
let saldo = 3_200_000;
export const cashFlow = Array.from({ length: 90 }, (_, i) => {
  const d = subDays(new Date(), 89 - i);
  const entrada = rnd(80_000, 340_000);
  const saida = rnd(60_000, 290_000);
  saldo = saldo + entrada - saida;
  return {
    dia: format(d, 'dd/MM'),
    date: d,
    entradas: entrada,
    saidas: saida,
    saldo: Math.round(saldo),
  };
});

// ── KPIs ─────────────────────────────────────────────────────────
const lastM = monthlyRevenue[monthlyRevenue.length - 1];
const prevM = monthlyRevenue[monthlyRevenue.length - 2];
const delta = (a, b) => parseFloat((((a - b) / b) * 100).toFixed(1));

export const kpis = {
  receita:      { value: lastM.receita,    prev: prevM.receita,    delta: delta(lastM.receita, prevM.receita)    },
  lucroLiq:     { value: lastM.lucroLiq,   prev: prevM.lucroLiq,   delta: delta(lastM.lucroLiq, prevM.lucroLiq)  },
  ebitda:       { value: lastM.ebitda,     prev: prevM.ebitda,     delta: delta(lastM.ebitda, prevM.ebitda)      },
  margem:       { value: lastM.margem,     prev: prevM.margem,     delta: delta(lastM.margem, prevM.margem)      },
  saldoCaixa:   { value: saldo,            prev: saldo * 0.95,     delta: 5.2                                    },
  inadimplencia:{ value: 3.8,              prev: 4.1,              delta: -7.3                                   },
  ticketMedio:  { value: 14_280,           prev: 13_900,           delta: 2.7                                    },
  colaboradores:{ value: 298,              prev: 295,              delta: 1.0                                    },
};

// ── Vendas por segmento ───────────────────────────────────────────
export const vendasSegmento = [
  { name: 'Corporativo',  value: 38, color: '#F59E0B' },
  { name: 'Varejo',       value: 27, color: '#3B82F6' },
  { name: 'Governo',      value: 18, color: '#8B5CF6' },
  { name: 'Exportação',   value: 12, color: '#10B981' },
  { name: 'Outros',       value: 5,  color: '#6B7280' },
];

// ── Top clientes ──────────────────────────────────────────────────
const clientes = [
  'Grupo Ômega S.A.', 'Petroforte Ltda.', 'Construtora Meridian', 'TechVale S.A.',
  'Alimentos Ipê', 'Logística FastMove', 'Banco Atlântico', 'Saúde Prime S.A.',
  'Energia Solar BR', 'Varejo Max Ltda.', 'Indústria Plena', 'Agro Norte S.A.',
];
export const topClientes = clientes.map((nome, i) => ({
  id: i + 1,
  nome,
  segmento: vendasSegmento[i % 5].name,
  receitaAnual: rnd(280_000, 1_800_000),
  pedidos: rnd(12, 180),
  ticketMedio: rnd(8_000, 42_000),
  status: i < 9 ? 'Ativo' : 'Em risco',
  adimplencia: rnd(88, 100),
}));

// ── Pedidos de venda ─────────────────────────────────────────────
const produtos = ['Sistema ERP Pro', 'Consultoria TI', 'Licença Cloud', 'Manutenção Anual', 'Módulo BI', 'Suporte Premium', 'Infraestrutura', 'Treinamento'];
const statuses = ['Pago', 'Pago', 'Pago', 'Pendente', 'Em aberto', 'Cancelado'];
const statusW  = [4, 3, 2, 3, 2, 1]; // weights

function weightedStatus() {
  const total = statusW.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < statuses.length; i++) { r -= statusW[i]; if (r <= 0) return statuses[i]; }
  return statuses[0];
}

export const pedidosVenda = Array.from({ length: 200 }, (_, i) => {
  const cliente = clientes[rnd(0, clientes.length - 1)];
  const produto = produtos[rnd(0, produtos.length - 1)];
  const valor = rnd(4_000, 320_000);
  const dias = rnd(0, 360);
  const st = weightedStatus();
  return {
    id: `VND-${String(10200 + i).padStart(5, '0')}`,
    data: format(subDays(new Date(), dias), 'dd/MM/yyyy'),
    cliente,
    produto,
    valor,
    status: st,
    formaPgto: ['Boleto', 'PIX', 'Cartão', 'Transferência'][rnd(0, 3)],
    vendedor: ['Ana Costa', 'Bruno Lima', 'Carla Dias', 'Diego Matos', 'Elena Souza'][rnd(0, 4)],
    vencimento: format(subDays(new Date(), dias - 30), 'dd/MM/yyyy'),
  };
});

// ── Compras / Fornecedores ────────────────────────────────────────
const fornecedores = [
  'AWS Brasil', 'Microsoft Ltda.', 'Oracle do Brasil', 'Salesforce BR',
  'Telefônica', 'Claro Empresas', 'Localiza Frota', 'Sodexo BR',
  'Unimed Empresarial', 'Bradesco Seguros', 'Correios', 'DHL Express',
  'Dell Computadores', 'Lenovo Brasil', 'Schneider Electric',
];
const categorias = ['TI/Infra', 'Telecom', 'RH/Benefícios', 'Logística', 'Seguros', 'Equipamentos', 'Marketing', 'Facilities'];

export const pedidosCompra = Array.from({ length: 180 }, (_, i) => {
  const forn = fornecedores[rnd(0, fornecedores.length - 1)];
  const cat = categorias[rnd(0, categorias.length - 1)];
  const valor = rnd(1_200, 180_000);
  const dias = rnd(0, 365);
  return {
    id: `PO-${String(20100 + i).padStart(5, '0')}`,
    data: format(subDays(new Date(), dias), 'dd/MM/yyyy'),
    fornecedor: forn,
    categoria: cat,
    valor,
    status: ['Aprovado', 'Aprovado', 'Aprovado', 'Pendente', 'Em análise', 'Cancelado'][rnd(0, 5)],
    aprovador: ['CEO', 'CFO', 'Dir. TI', 'Dir. RH', 'Dir. Op.'][rnd(0, 4)],
    centro: ['TI', 'Comercial', 'Operações', 'RH', 'Financeiro', 'Marketing'][rnd(0, 5)],
  };
});

// ── DRE anual ────────────────────────────────────────────────────
export const dreAnual = {
  receitaBruta: 54_800_000,
  deducoes: 4_932_000,
  receitaLiquida: 49_868_000,
  cogs: 21_448_000,
  lucroBruto: 28_420_000,
  despesasComerciais: 6_210_000,
  despesasAdmin: 7_840_000,
  despesasFinanceiras: 1_220_000,
  outrasReceitas: 380_000,
  ebit: 13_530_000,
  ir: 4_060_000,
  lucroLiquido: 9_470_000,
};

// ── Contas a receber ─────────────────────────────────────────────
export const contasReceber = [
  { faixa: '0-30 dias',    valor: 8_420_000, qtd: 47, cor: '#10B981' },
  { faixa: '31-60 dias',   valor: 3_180_000, qtd: 21, cor: '#F59E0B' },
  { faixa: '61-90 dias',   valor: 1_240_000, qtd: 12, cor: '#F97316' },
  { faixa: '+90 dias',     valor: 980_000,   qtd: 9,  cor: '#EF4444' },
];

export const contasPagar = [
  { faixa: '0-30 dias',    valor: 5_820_000, qtd: 38, cor: '#10B981' },
  { faixa: '31-60 dias',   valor: 2_340_000, qtd: 18, cor: '#F59E0B' },
  { faixa: '61-90 dias',   valor: 680_000,   qtd: 8,  cor: '#F97316' },
  { faixa: '+90 dias',     valor: 210_000,   qtd: 3,  cor: '#EF4444' },
];

// ── Alertas ──────────────────────────────────────────────────────
export const alertas = [
  { id: 1, tipo: 'danger',  titulo: 'Inadimplência acima do limite',    msg: '3 clientes com +90d: R$ 980k em risco',       data: '23/04/2025', lido: false },
  { id: 2, tipo: 'warning', titulo: 'Fluxo de caixa crítico em 15d',    msg: 'Saldo projetado cai abaixo de R$ 800k',       data: '22/04/2025', lido: false },
  { id: 3, tipo: 'warning', titulo: 'Meta de vendas — 78% atingida',     msg: 'Faltam R$ 1,1M para meta mensal',             data: '22/04/2025', lido: false },
  { id: 4, tipo: 'info',    titulo: 'Renovação contrato AWS',            msg: 'Vencimento em 12 dias — R$ 84.000/ano',       data: '21/04/2025', lido: false },
  { id: 5, tipo: 'success', titulo: 'Lucro líquido bateu recorde',       msg: 'Margem líquida de 17,3% em Março/25',         data: '21/04/2025', lido: true  },
  { id: 6, tipo: 'danger',  titulo: 'PO-20187 sem aprovação há 8 dias',  msg: 'Compra Oracle R$ 142k travada — CFO pendente', data: '20/04/2025', lido: true  },
  { id: 7, tipo: 'info',    titulo: 'Auditoria interna agendada',        msg: 'BDO — início em 05/05/2025',                  data: '19/04/2025', lido: true  },
  { id: 8, tipo: 'warning', titulo: 'Estorno processado — cliente IPÊ',  msg: 'VND-10284 cancelado — R$ 38.000',             data: '18/04/2025', lido: true  },
];

// ── Forecast (próximos 6 meses) ──────────────────────────────────
export const forecast = Array.from({ length: 6 }, (_, i) => {
  const base = lastM.receita * (1 + 0.018 * (i + 1));
  return {
    mes: fmtMonth(new Date(new Date().setMonth(new Date().getMonth() + i + 1))),
    receitaProjetada: Math.round(base),
    receitaOtimista:  Math.round(base * 1.08),
    receitaPessimista:Math.round(base * 0.92),
  };
});

// ── Vendas por vendedor ──────────────────────────────────────────
export const vendasPorVendedor = [
  { nome: 'Ana Costa',   meta: 1_200_000, realizado: 1_380_000, deals: 42 },
  { nome: 'Bruno Lima',  meta: 1_000_000, realizado: 920_000,  deals: 31 },
  { nome: 'Carla Dias',  meta: 1_100_000, realizado: 1_210_000, deals: 38 },
  { nome: 'Diego Matos', meta: 900_000,   realizado: 760_000,  deals: 24 },
  { nome: 'Elena Souza', meta: 1_300_000, realizado: 1_450_000, deals: 51 },
];

// ── Despesas por centro de custo ─────────────────────────────────
export const despesasCentro = months.slice(-6).map((m) => ({
  mes: fmtMonth(m),
  TI:         rnd(180_000, 260_000),
  Comercial:  rnd(320_000, 480_000),
  Operações:  rnd(280_000, 420_000),
  RH:         rnd(940_000, 1_100_000),
  Financeiro: rnd(80_000, 130_000),
  Marketing:  rnd(120_000, 200_000),
}));
