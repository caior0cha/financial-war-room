import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import Sidebar from './components/layout/Sidebar';
import Overview  from './pages/Overview';
import CashFlow  from './pages/CashFlow';
import Vendas    from './pages/Vendas';
import Compras   from './pages/Compras';
import DRE       from './pages/DRE';
import Contas    from './pages/Contas';
import Alertas   from './pages/Alertas';

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100 dark:bg-surface-950 light:bg-surface-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30 md:z-auto
        transform transition-transform duration-250
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main scroll area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Routes>
          <Route path="/"         element={<Overview  onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/cashflow" element={<CashFlow  onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/vendas"   element={<Vendas    onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/compras"  element={<Compras   onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/dre"      element={<DRE       onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/contas"   element={<Contas    onMobileMenu={() => setMobileOpen(o => !o)} />} />
          <Route path="/alertas"  element={<Alertas   onMobileMenu={() => setMobileOpen(o => !o)} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
