/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export const ClientPurchases = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('sale_type', 'ONLINE_STORE')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setPurchases(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPurchases(); }, []);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase">Mis Compras</h1>
        <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">Historial de pedidos en tienda</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono">CARGANDO HISTORIAL...</div>
        ) : purchases.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
             <Package size={48} className="text-slate-800" />
             <p className="text-slate-500 font-bold uppercase italic">Aún no has realizado compras</p>
          </div>
        ) : (
          purchases.map((sale) => (
            <div key={sale.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-sky-500/50 transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-sky-400">
                     <Clock size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID PEDIDO: {sale.id.substring(0,8)}</p>
                     <h3 className="text-lg font-bold text-white uppercase italic">Pedido del {new Date(sale.created_at).toLocaleDateString()}</h3>
                     <div className="flex gap-2 mt-1">
                        {Object.values(sale.items || {}).map((item: any, i) => (
                          <span key={i} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                            {item.name} x{item.qty}
                          </span>
                        ))}
                     </div>
                   </div>
                </div>
                <div className="flex flex-col md:items-end justify-center">
                  <p className="text-2xl font-black text-white italic tracking-tighter">${sale.total_amount}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mt-2 border ${
                    sale.status === 'PENDING_WHATSAPP' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    sale.status === 'IN_PROCESS' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                    sale.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {sale.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
