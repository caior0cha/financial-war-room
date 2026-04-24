import { Sun, Moon, Download, RefreshCw, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Topbar({ title, subtitle, onMobileMenu }) {
  const { dark, toggle } = useTheme();
  const now = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <header className="h-16 flex-shrink-0 flex items-center gap-4 px-6
      border-b border-white/[0.06]
      bg-white/[0.01] dark:bg-slate-950/60 backdrop-blur-sm sticky top-0 z-20">

      {/* Mobile menu */}
      <button onClick={onMobileMenu} className="md:hidden text-gray-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-white text-sm font-semibold truncate font-display tracking-wide">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-xs capitalize truncate">{subtitle || now}</p>
        )}
      </div>

      {/* Date */}
      <span className="hidden lg:block text-gray-600 text-xs mono capitalize">{now}</span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/[0.07] transition-all"
          title={dark ? 'Modo claro' : 'Modo escuro'}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/[0.07] transition-all"
          title="Atualizar dados"
        >
          <RefreshCw size={15} />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 alert-dot" />
          <span className="text-xs text-gray-500 hidden sm:block">Live</span>
        </div>
      </div>
    </header>
  );
}
