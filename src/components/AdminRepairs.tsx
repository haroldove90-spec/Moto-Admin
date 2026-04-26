/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ServiceOrder, UserRole, OrderStatus } from '../types';
import { FileText, ChevronRight, Filter, Download } from 'lucide-react';
import { exportToPDF } from '../lib/pdfExport';

export const AdminRepairs = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch mechanics for the filter
    const { data: mechData } = await supabase.from('profiles').select('*').eq('role', UserRole.MECHANIC);
    setMechanics(mechData || []);

    // Fetch all service orders
    let query = supabase.from('service_orders').select(`
      *,
      technician:profiles(full_name),
      tasks(*)
    `).order('updated_at', { ascending: false });

    if (selectedMechanic !== 'all') {
      query = query.eq('technician_id', selectedMechanic);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else {
      const mapped = (data || []).map(o => ({
        id: (o as any).id,
        customerName: o.customer_name,
        bikeModel: o.bike_model,
        plateNumber: o.plate_number,
        status: o.status as OrderStatus,
        dateReceived: o.date_received,
        technicianId: o.technician_id,
        technicianName: o.technician?.full_name,
        tasks: o.tasks || [],
        totalBudget: o.total_budget,
        notes: o.notes
      })) as any[];
      setOrders(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMechanic]);

  const handleExportPDF = () => {
    const columns = ["ORDEN", "CLIENTE", "MOTO", "ESTADO", "MECÁNICO", "MONTO"];
    const data = orders.map(o => [
      o.id.substring(0, 8),
      o.customerName,
      `${o.bikeModel} (${o.plateNumber})`,
      o.status,
      o.technicianName || 'Sin asignar',
      `$${o.totalBudget}`
    ]);
    exportToPDF("Reporte de Reparaciones Técnicas", columns, data, "reparaciones");
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Monitor de Reparaciones</h1>
          <p className="text-slate-400 font-mono text-sm tracking-tighter">ADMIN // REPAIR_MONITOR</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <Filter size={18} className="text-slate-500" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filtrar por Mecánico:</span>
        <select 
          value={selectedMechanic}
          onChange={(e) => setSelectedMechanic(e.target.value)}
          className="bg-slate-800 border-none text-sm text-white rounded-lg px-4 py-2 outline-none focus:ring-2 ring-sky-500/20 transition"
        >
          <option value="all">Todos los mecánicos</option>
          {mechanics.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
              <th className="px-6 py-4 font-medium uppercase tracking-tighter">ID</th>
              <th className="px-6 py-4 font-medium uppercase tracking-tighter">Vehículo & Cliente</th>
              <th className="px-6 py-4 font-medium uppercase tracking-tighter">Mecánico Asignado</th>
              <th className="px-6 py-4 font-medium uppercase tracking-tighter">Tareas</th>
              <th className="px-6 py-4 font-medium uppercase tracking-tighter">Estado</th>
              <th className="px-6 py-4 font-medium uppercase tracking-tighter text-right">Costo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-500">CARGANDO REPARACIONES...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-500">No se encontraron registros.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{(order as any).id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white uppercase italic">{order.bikeModel}</div>
                    <div className="text-[10px] text-slate-400">{order.customerName} • {order.plateNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-400 uppercase">
                        {(order as any).technicianName?.charAt(0) || '?'}
                       </div>
                       <span className="text-slate-300">{(order as any).technicianName || 'Pendiente'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {order.tasks.map((t, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${t.isCompleted ? 'bg-emerald-400' : 'bg-slate-600'}`} title={t.description} />
                      ))}
                      {order.tasks.length === 0 && <span className="text-[10px] text-slate-600">S/T</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${
                      order.status === OrderStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === OrderStatus.IN_PROGRESS ? 'bg-sky-500/20 text-sky-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-white">${order.totalBudget}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
