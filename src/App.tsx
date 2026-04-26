/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Wrench, 
  ClipboardList, 
  Package, 
  BarChart3, 
  ShoppingCart, 
  ChevronRight,
} from 'lucide-react';
import { UserRole } from './types';
import { AdminMechanics } from './components/AdminMechanics';
import { AdminShop } from './components/AdminShop';
import { AdminRepairs } from './components/AdminRepairs';
import { AdminSales } from './components/AdminSales';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('role') as UserRole) || UserRole.ADMIN;
  });
  const [activeModule, setActiveModule] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'dash';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simple Router Simulation
  const selectedProductId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('productId');
  }, []);
  const navigation = useMemo(() => {
    switch (activeRole) {
      case UserRole.ADMIN:
        return [
          { id: 'dash', label: 'Dashboard', icon: BarChart3 },
          { id: 'mechanics', label: 'Mecánicos', icon: User },
          { id: 'repairs', label: 'Reparaciones', icon: ClipboardList },
          { id: 'shop', label: 'Catálogo Tienda', icon: Package },
          { id: 'sales', label: 'Ventas Neta', icon: ShoppingCart },
        ];
      case UserRole.CLIENT:
        return [
          { id: 'store', label: 'Tienda Online', icon: ShoppingCart },
        ];
      default:
        return [];
    }
  }, [activeRole]);

  const renderActiveModule = () => {
    if (activeRole === UserRole.ADMIN) {
      switch (activeModule) {
        case 'dash': return <AdminSales />; // Simplified for this turn
        case 'mechanics': return <AdminMechanics />;
        case 'repairs': return <AdminRepairs />;
        case 'shop': return <AdminShop />;
        case 'sales': return <AdminSales />;
        default: return <AdminSales />;
      }
    }
    return <div className="p-10 text-slate-500 font-mono text-center">Módulo en construcción para el rol {activeRole}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex overflow-hidden h-screen">
      {/* Role Switcher Drawer (Demo Helper) */}
      <div className="fixed top-4 right-4 z-50 pointer-events-auto">
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-2 rounded-xl flex gap-1 shadow-2xl">
          {Object.values(UserRole).map((role) => (
            <button
              key={role}
              onClick={() => { setActiveRole(role); setActiveModule(role === UserRole.ADMIN ? 'dash' : 'shop'); }}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                activeRole === role ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-slate-900 border-r border-slate-800 flex flex-col relative z-30"
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">MT</div>
            {isSidebarOpen && <span className="text-lg font-bold tracking-tight">MOTO-TECH PRO</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
           <div className={`text-[10px] uppercase tracking-widest text-slate-600 font-black mb-4 px-2 ${!isSidebarOpen && 'text-center'}`}>
            {isSidebarOpen ? 'ADMINISTRACIÓN' : 'ADM'}
          </div>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all group ${
                activeModule === item.id ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} className={activeModule === item.id ? 'text-sky-400' : 'text-slate-500'} />
              {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400 text-xs">JP</div>
             {isSidebarOpen && (
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-white truncate">Juan Pérez</p>
                 <p className="text-[10px] text-slate-500 uppercase">{activeRole}</p>
               </div>
             )}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white shadow-lg transition-colors"
        >
          {isSidebarOpen ? <ChevronRight size={12} className="rotate-180" /> : <ChevronRight size={12} />}
        </button>
      </motion.aside>

      <main className="flex-1 overflow-y-auto relative bg-slate-950">
        <header className="h-16 border-b border-slate-900 bg-slate-950/50 backdrop-blur-md flex justify-between items-center px-8 sticky top-0 z-20">
          <div className="flex gap-8 text-xs">
            <div className="flex items-center gap-2"><span className="text-slate-500">Taller:</span><span className="font-semibold">Sede Principal</span></div>
            <div className="flex items-center gap-2"><span className="text-slate-500">Estado:</span><span className="text-emerald-400 font-bold uppercase tracking-widest">En Línea</span></div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeRole}-${activeModule}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderActiveModule()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
