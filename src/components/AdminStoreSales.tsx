/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, ShoppingBag, Eye, FileText, CheckCircle, Clock } from 'lucide-react';
import { exportToPDF } from '../lib/pdfExport';

export const AdminStoreSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('sale_type', 'ONLINE_STORE')
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setSales(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSales(); }, []);

  const handleExportPDF = () => {
    const columns = ["ID", "FECHA", "ITEMS", "TOTAL", "STATUS"];
    const data = sales.map(s => [
      s.id.substring(0,8),
      new Date(s.created_at).toLocaleDateString(),
      Object.keys(s.items || {}).length + " prod",
      `$${s.total_amount}`,
      s.status
    ]);
    exportToPDF("Reporte Ventas Online Store", columns, data, "ventas_online");
  };

  const updateSaleStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setSales(current => current.map(s => s.id === id ? { ...s, status: newStatus } : s));
      if (selectedSale?.id === id) {
        setSelectedSale({ ...selectedSale, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_WHATSAPP': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'IN_PROCESS': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white italic uppercase">Ventas Refacciones (Tienda)</h1>
          <p className="text-slate-400 font-mono text-sm tracking-tighter">E-COMMERCE // STORE_REVENUE</p>
        </div>
        <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2">
          <Download size={18} /> Exportar Listado
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left font-mono text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-900 text-slate-500 border-b border-slate-700">
                <th className="px-6 py-4 font-bold uppercase text-[10px]">ID</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px]">Fecha</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] text-right">Monto</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px]">Estado</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-500">BUSCANDO REGISTROS...</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className={`hover:bg-slate-700/20 transition-all cursor-pointer ${selectedSale?.id === sale.id ? 'bg-sky-500/5' : ''}`} onClick={() => setSelectedSale(sale)}>
                  <td className="px-6 py-4 text-white font-bold">{sale.id.substring(0,8)}</td>
                  <td className="px-6 py-4 text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-black text-white text-right">${sale.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getStatusColor(sale.status)}`}>
                      {sale.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-6 text-slate-500 border-b border-slate-800 pb-4">
             <ShoppingBag size={20} />
             <h2 className="font-bold uppercase italic tracking-tighter">Detalle de Venta</h2>
          </div>
          
          {selectedSale ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pedido ID</p>
                   <p className="text-white font-mono text-xs">{selectedSale.id}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Estado</p>
                   <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getStatusColor(selectedSale.status)}`}>
                      {selectedSale.status.replace('_', ' ')}
                    </span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Productos</p>
                 {Object.entries(selectedSale.items || {}).map(([id, item]: any) => (
                   <div key={id} className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                     <span className="text-slate-300">{item.name} <span className="text-slate-500 text-xs">x{item.qty}</span></span>
                     <span className="text-white font-bold">${item.price * item.qty}</span>
                   </div>
                 ))}
               </div>

               <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cambiar Estado</p>
                 <div className="grid grid-cols-2 gap-2">
                   {[
                     { id: 'PENDING_WHATSAPP', label: 'Pendiente', color: 'hover:bg-amber-500/20' },
                     { id: 'IN_PROCESS', label: 'En Proceso', color: 'hover:bg-sky-500/20' },
                     { id: 'COMPLETED', label: 'Completado', color: 'hover:bg-emerald-500/20' },
                     { id: 'CANCELLED', label: 'Cancelado', color: 'hover:bg-rose-500/20' }
                   ].map((st) => (
                     <button
                       key={st.id}
                       onClick={() => updateSaleStatus(selectedSale.id, st.id)}
                       className={`text-[10px] font-black uppercase py-2 rounded-lg border border-slate-700 transition-all ${st.color} ${selectedSale.status === st.id ? 'bg-slate-700 border-slate-500 text-white' : 'text-slate-500'}`}
                     >
                       {st.label}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="flex justify-between items-end pt-4 border-t border-slate-800">
                 <div>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Venta</p>
                   <p className="text-3xl font-black text-white italic tracking-tighter">${selectedSale.total_amount}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Utilidad</p>
                   <p className="text-xl font-bold text-emerald-400 italic">${selectedSale.profit}</p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-4">
               <FileText size={48} className="text-slate-800" />
               <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Selecciona una venta para ver el desglose</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
