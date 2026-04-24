import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, DollarSign,
  BarChart3, CreditCard, Bell, ChevronLeft, ChevronRight,
  Zap,
} from 'lucide-react';
// IMPORT ATUALIZADO: Usando o Hook em vez do mockData
import { useAlerts } from '../../hooks/useAlerts'; 

const nav = [
  { to: '/',        icon: LayoutDashboard, label: 'Visão Geral'   },
  { to: '/cashflow', icon: DollarSign,      label: 'Fluxo de Caixa'},
  { to: '/vendas',   icon: TrendingUp,      label: 'Vendas'        },
  { to: '/compras',  icon: ShoppingCart,    label: 'Compras'       },
  { to: '/dre',      icon: BarChart3,       label: 'DRE'           },
  { to: '/contas',   icon: CreditCard,      label: 'Contas'        },
  { to: '/alertas',  icon: Bell,            label: 'Alertas'       },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  // LENDO DO CONTEXTO: O número agora atualiza sozinho
  const { unreadCount } = useAlerts();

  return (
    <aside
      className={`sidebar-transition flex-shrink-0 flex flex-col h-screen sticky top-0 z-30
        bg-surface-100 dark:bg-surface-950 border-r border-white/[0.06]
        ${collapsed ? 'w-16' : 'w-56'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0`}>
        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
          <Zap size={16} className="text-black" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-display text-[11px] font-700 tracking-widest uppercase leading-none">Financial WarRoom</p>
            <p className="text-gray-500 text-[9px] tracking-widest uppercase mt-0.5">Rocha Agency</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-md mb-0.5 text-[13px] font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                 : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/[0.05] border border-transparent'
               }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate font-body">{label}</span>}

            {/* Badge alertas: AGORA USA O unreadCount DO HOOK */}
            {label === 'Alertas' && unreadCount > 0 && (
              <span className={`ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center alert-dot ${collapsed ? 'absolute top-1 right-1' : ''}`}>
                {unreadCount}
              </span>
            )}

            {/* Tooltip when collapsed */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-slate-900 border border-white/10 rounded text-slate-800 dark:text-slate-100 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs py-1.5 rounded hover:bg-white/[0.05]"
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="font-body">Recolher</span></>}
        </button>
      </div>
    </aside>
  );
}