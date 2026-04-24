import Papa from 'papaparse';

export const fmt = {
  currency: (v, compact = false) => {
    if (compact) {
      if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
      if (Math.abs(v) >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  },
  pct: (v, decimals = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`,
  number: (v) => new Intl.NumberFormat('pt-BR').format(v),
};

export function exportCSV(data, filename = 'export') {
  const csv = Papa.unparse(data);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function filterRows(rows, search, fields) {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(q)));
}

export function paginate(rows, page, perPage) {
  const start = (page - 1) * perPage;
  return rows.slice(start, start + perPage);
}

export const deltaColor = (v) =>
  v > 0 ? 'text-emerald-400' : v < 0 ? 'text-red-400' : 'text-gray-400';

export const statusColor = (s) => ({
  'Pago':       'bg-emerald-500/15 text-emerald-400',
  'Aprovado':   'bg-emerald-500/15 text-emerald-400',
  'Pendente':   'bg-amber-500/15 text-amber-400',
  'Em aberto':  'bg-amber-500/15 text-amber-400',
  'Em análise': 'bg-blue-500/15 text-blue-400',
  'Cancelado':  'bg-red-500/15 text-red-400',
  'Em risco':   'bg-red-500/15 text-red-400',
  'Ativo':      'bg-emerald-500/15 text-emerald-400',
}[s] ?? 'bg-gray-500/15 text-gray-400');
