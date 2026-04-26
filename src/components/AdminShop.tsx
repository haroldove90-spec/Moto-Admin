/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';
import { Plus, Save, X, Trash2, Image as ImageIcon, Camera, ExternalLink, Upload } from 'lucide-react';

export const AdminShop = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else {
      const mapped = (data || []).map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        stock: p.stock,
        minStock: p.min_stock,
        costPrice: p.cost_price,
        sellPrice: p.sell_price,
        location: p.location,
        primaryImage: p.primary_image_url,
        secondaryImages: p.secondary_image_urls
      })) as InventoryItem[];
      setProducts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este producto permanentemente?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchProducts();
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Administración de Tienda</h1>
          <p className="text-slate-400 font-mono text-sm tracking-tighter">SHOP // INVENTORY_CONTROL</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-mono">CARGANDO INVENTARIO...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
            Tu tienda está vacía. Agrega productos para comenzar.
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="geometric-card flex flex-col group h-full">
              <div className="aspect-square bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-slate-700 relative">
                {p.primaryImage ? (
                  <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-slate-700" />
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                    className="p-1.5 bg-slate-800 text-white rounded hover:bg-sky-600 transition shadow-lg"
                  >
                    <FileText size={14} />
                  </button>
                  <button 
                    onClick={() => window.open(`/?view=shop&productId=${p.id}&role=CLIENT`, '_blank')}
                    className="p-1.5 bg-slate-800 text-white rounded hover:bg-emerald-600 transition shadow-lg"
                    title="Ver en tienda"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 bg-slate-800 text-white rounded hover:bg-rose-600 transition shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-black text-sky-400 uppercase mb-1">{p.category}</span>
                <h3 className="font-bold text-white mb-1 line-clamp-1">{p.name}</h3>
                <div className="flex justify-between items-end mt-auto">
                  <div className="font-mono">
                    <p className="text-[10px] text-slate-500">STOCK</p>
                    <p className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-rose-400' : 'text-slate-300'}`}>{p.stock} u.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">PRECIO</p>
                    <p className="text-xl font-black text-white">${p.sellPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          initialData={editingProduct} 
          onCancel={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchProducts(); }} 
        />
      )}
    </div>
  );
};

import { FileText } from 'lucide-react';

const ProductModal = ({ initialData, onCancel, onSuccess }: { initialData: InventoryItem | null, onCancel: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 5,
    costPrice: initialData?.costPrice || 0,
    sellPrice: initialData?.sellPrice || 0,
    location: initialData?.location || '',
    primaryImage: initialData?.primaryImage || '',
    secondaryImages: initialData?.secondaryImages?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'secondary') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const results: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        results.push(publicUrl);
      }

      if (type === 'primary') {
        setFormData({ ...formData, primaryImage: results[0] });
      } else {
        const current = formData.secondaryImages ? formData.secondaryImages.split(',').map(s => s.trim()).filter(Boolean) : [];
        setFormData({ ...formData, secondaryImages: [...current, ...results].join(', ') });
      }
    } catch (error: any) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        stock: Number(formData.stock),
        min_stock: Number(formData.minStock),
        cost_price: Number(formData.costPrice),
        sell_price: Number(formData.sellPrice),
        location: formData.location,
        primary_image_url: formData.primaryImage,
        secondary_image_urls: formData.secondaryImages.split(',').map(s => s.trim()).filter(Boolean)
      };

      let error;
      if (initialData) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', initialData.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('products').insert([payload]);
        error = err;
      }

      if (error) {
        console.error('Error saving product:', error);
        alert('Error: ' + error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Exception saving product:', err);
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold italic uppercase tracking-tighter">
            {initialData ? 'Editar Refacción' : 'Nueva Refacción'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SKU / Referencia</label>
              <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" placeholder="Ej. ACC-123" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nombre del Producto</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" placeholder="Ej. Aceite 10W40" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Descripción</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" placeholder="Detalles técnicos..." />
            </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Categoría</label>
                <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" placeholder="Motor, Frenos..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ubicación</label>
                <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" placeholder="Pasillo A-1" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Costo Compra</label>
                <input type="number" required value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Precio Venta</label>
                <input type="number" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Inicial</label>
                <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stock Mínimo</label>
                <input type="number" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500" />
              </div>
            </div>
            <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ImageIcon size={10} /> Imagen Principal
              </label>
              {formData.primaryImage && (
                <img src={formData.primaryImage} className="w-20 h-20 object-cover rounded-lg mb-2" />
              )}
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Principal'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'primary')} disabled={uploading} />
              </label>
            </div>
            <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Camera size={10} /> Imágenes Secundarias
              </label>
              <div className="flex gap-2 flex-wrap justify-center mb-2">
                {formData.secondaryImages.split(',').filter(Boolean).map((img, i) => (
                  <img key={i} src={img.trim()} className="w-10 h-10 object-cover rounded-md" />
                ))}
              </div>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir Más'}
                <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'secondary')} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 pt-4 flex gap-4">
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-500 transition shadow-lg shadow-sky-950 flex items-center justify-center gap-2">
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
