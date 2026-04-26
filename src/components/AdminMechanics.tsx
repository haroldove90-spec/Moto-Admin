/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { Plus, Save, X, Trash2, FileText, UserPlus } from 'lucide-react';

interface MechanicFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: User | null;
}

export const AdminMechanics = () => {
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMechanics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', UserRole.MECHANIC);
    
    if (error) console.error(error);
    else {
      const mapped = (data || []).map(p => ({
        id: p.id,
        name: p.full_name || 'Sin Nombre',
        email: p.email,
        role: p.role as UserRole
      }));
      setMechanics(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este mecánico?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchMechanics();
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestión de Mecánicos</h1>
          <p className="text-slate-400 font-mono text-sm tracking-tighter">ADMIN // STAFF_MANAGEMENT</p>
        </div>
        <button 
          onClick={() => { setEditingMechanic(null); setIsModalOpen(true); }}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2"
        >
          <UserPlus size={18} />
          Alta Mecánico
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-mono">CARGANDO PERSONAL...</div>
        ) : mechanics.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No hay mecánicos registrados.
          </div>
        ) : (
          mechanics.map((m) => (
            <div key={m.id} className="geometric-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-sky-400 font-bold text-xl">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingMechanic(m); setIsModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                    >
                      <FileText size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-white">{m.name}</h3>
                <p className="text-sm text-slate-400 font-mono">{m.email}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="status-badge bg-emerald-500/20 text-emerald-400">Activo</span>
                <button className="text-xs font-bold text-sky-400 hover:underline">Ver Reparaciones</button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <MechanicModal 
          initialData={editingMechanic} 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchMechanics(); }} 
        />
      )}
    </div>
  );
};

const MechanicModal = ({ initialData, onCancel, onSuccess }: MechanicFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '', // In real app, handle auth properly
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        role: UserRole.MECHANIC,
      };

      let error;
      if (initialData) {
        const { error: err } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', initialData.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('profiles')
          .insert([payload]);
        error = err;
      }

      if (error) {
        console.error('Error saving mechanic:', error);
        alert('Error: ' + error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception saving mechanic:', err);
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {initialData ? 'Editar Mecánico' : 'Nuevo Mecánico'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-sky-500 outline-none transition"
              placeholder="Ej. Juan Mecánico"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-sky-500 outline-none transition"
              placeholder="mecanico@taller.com"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-500 transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
