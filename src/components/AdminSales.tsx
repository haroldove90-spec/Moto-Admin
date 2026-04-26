/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, TrendingUp, ShoppingBag, CreditCard, FileText } from 'lucide-react';
import { exportToPDF } from '../lib/pdfExport';

export const AdminSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setSales(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSales(); }, []);

  const handleExportPDF = () => {
    const columns = ["FECHA", "TIPO", "DETALLE", "MONTO", "UTILIDAD"];
    const data = sales.map(s => [
      new Date(s.created_at).toLocaleDateString(),
      s.sale_type,
      s.items ? Object.keys(s.items).length + " items" : "Servicio",
      `$${s.total_amount}`,
      `$${s.profit}`
    ]);
    exportToPDF("Reporte Histórico de Ventas", columns, data, "ventas");
  };

  const totals = {
    revenue: sales.reduce((acc, s) => acc + Number(s.total_amount), 0),
    profit: sales.reduce((acc, s) => acc + Number(s.profit), 0),
    count: sales.length
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Ventas & Rentabilidad</h1>
          <p className="text-slate-400 font-mono text-sm tracking-tighter">FINANCE // SALES_LOG</p>
        </div>
        <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2">
          <Download size={18} /> Reporte PDF
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="geometric-card">
          <TrendingUp className="text-emerald-400 mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ingresos Totales</p>
          <p className="text-3xl font-black text-white italic">${totals.revenue.toLocaleString()}</p>
        </div>
        <div className="geometric-card">
          <CreditCard className="text-sky-400 mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Utilidad Acumulada</p>
          <p className="text-3xl font-black text-emerald-400 italic">${totals.profit.toLocaleString()}</p>
        </div>
        <div className="geometric-card">
          <ShoppingBag className="text-slate-400 mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Operaciones</p>
          <p className="text-3xl font-black text-white italic">{totals.count}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Fecha</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter">Tipo</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter text-right">Monto</th>
              <th className="px-6 py-4 font-bold uppercase tracking-tighter text-right italic">Ganancia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
             {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-500 font-mono">DATOS...</td></tr>
            ) : sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-700/20 transition-all">
                <td className="px-6 py-4 text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className="status-badge bg-slate-900 text-slate-400">{sale.sale_type}</span></td>
                <td className="px-6 py-4 font-black text-white text-right">${sale.total_amount}</td>
                <td className="px-6 py-4 font-bold text-emerald-400 text-right">${sale.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
