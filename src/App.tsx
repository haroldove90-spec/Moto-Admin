/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  Wrench, 
  Package, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu,
  ChevronLeft,
  X,
  Search,
  Bell,
  BarChart3, 
  ShoppingCart, 
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { UserRole } from './types';
import { AdminMechanics } from './components/AdminMechanics';
import { AdminShop } from './components/AdminShop';
import { AdminRepairs } from './components/AdminRepairs';
import { AdminSales } from './components/AdminSales';
import { ClientStore } from './components/ClientStore';
import { ClientPurchases } from './components/ClientPurchases';
import { AdminStoreSales } from './components/AdminStoreSales';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('role') as UserRole) || UserRole.ADMIN;
  });
  const [activeModule, setActiveModule] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || (params.get('role') === 'CLIENT' ? 'store' : 'dash');
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Auto-close sidebar on mobile when module changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [activeModule]);

  const selectedProductId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('productId') || undefined;
  }, []);

  const navigation = useMemo(() => {
    switch (activeRole) {
      case UserRole.ADMIN:
        return [
          { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'mechanics', label: 'Mecánicos', icon: User },
          { id: 'repairs', label: 'Reparaciones', icon: ClipboardList },
          { id: 'shop', label: 'Catálogo Tienda', icon: Package },
          { id: 'store_sales', label: 'Ventas Refacciones', icon: ShoppingCart },
          { id: 'sales', label: 'Ventas Taller', icon: CreditCard },
          { id: 'store', label: 'Vista Cliente', icon: Package },
        ];
      case UserRole.CLIENT:
        return [
          { id: 'store', label: 'Tienda Online', icon: ShoppingCart },
          { id: 'purchases', label: 'Mis Compras', icon: ClipboardList },
        ];
      default:
        return [];
    }
  }, [activeRole]);

  const renderActiveModule = () => {
    if (activeModule === 'store' || (activeRole === UserRole.CLIENT && activeModule === 'shop')) {
      return <ClientStore productId={selectedProductId} />;
    }

    if (activeModule === 'purchases') {
      return <ClientPurchases />;
    }

    if (activeRole === UserRole.ADMIN) {
      switch (activeModule) {
        case 'dash': return <AdminSales />;
        case 'mechanics': return <AdminMechanics />;
        case 'repairs': return <AdminRepairs />;
        case 'shop': return <AdminShop />;
        case 'sales': return <AdminSales />;
        case 'store_sales': return <AdminStoreSales />;
        default: return <AdminSales />;
      }
    }

    if (activeRole === UserRole.CLIENT) {
      switch (activeModule) {
        case 'store': return <ClientStore productId={selectedProductId} />;
        case 'purchases': return <ClientPurchases />;
        default: return <ClientStore productId={selectedProductId} />;
      }
    }

    return <div className="p-10 text-slate-500 font-mono text-center">Módulo en construcción para el rol {activeRole}</div>;
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '280px' : '260px') : '0px',
          x: isSidebarOpen || window.innerWidth >= 768 ? 0 : -280
        }}
        className={`bg-slate-900 border-r border-slate-800 flex flex-col z-50 h-full fixed md:relative`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center font-black text-white italic">MT</div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-black italic tracking-tighter text-xl">MOTO-TECH PRO</h1>
                <p className="text-[8px] text-slate-500 font-mono uppercase tracking-[0.2em] leading-none">Management System</p>
              </div>
            )}
          </div>
          {window.innerWidth < 768 && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {isSidebarOpen && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mb-4">Administración</p>}
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                activeModule === item.id 
                  ? 'bg-sky-600/10 text-sky-400 border border-sky-600/20 shadow-[0_0_20px_rgba(2,132,199,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={20} className={activeModule === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="bg-slate-950 rounded-2xl p-4 flex items-center gap-3 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-sky-400">JP</div>
              <div className="flex-1 min-w-0">
                <p className="font-black italic text-sm text-white truncate">Juan Pérez</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{activeRole}</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header Desktop/Mobile */}
        <header className="h-20 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 md:px-10 z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-sky-900/20"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex flex-col">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Taller:</p>
              <p className="font-black italic text-white tracking-tighter uppercase whitespace-nowrap">Sede Principal</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 scale-90 md:scale-100 shadow-2xl">
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setActiveModule(role === UserRole.ADMIN ? 'dash' : 'store');
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                  activeRole === role 
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">En Línea</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white relative bg-slate-900 rounded-xl border border-slate-800">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-950" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRole}-${activeModule}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderActiveModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
