/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';
import { ShoppingCart, Search, Filter, ArrowLeft, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export const ClientStore = ({ productId }: { productId?: string }) => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
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
      
      if (productId) {
        const found = mapped.find(p => p.id === productId);
        if (found) setSelectedProduct(found);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [productId]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProduct) {
    return (
      <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedProduct(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group">
              {selectedProduct.primaryImage ? (
                <img src={selectedProduct.primaryImage} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">No hay imagen</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {selectedProduct.secondaryImages?.map((img, i) => (
                <div key={i} className="aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-sky-500 transition shadow-lg">
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full">{selectedProduct.category}</span>
              <h1 className="text-4xl font-black text-white mt-4 italic tracking-tighter uppercase">{selectedProduct.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="none" />
                </div>
                <span className="text-xs text-slate-500">(12 reseñas)</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-lg">{selectedProduct.description}</p>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Precio Online</p>
                  <p className="text-5xl font-black text-white italic">${selectedProduct.sellPrice}</p>
                </div>
                <div className="text-right">
                   <p className={`text-xs font-bold uppercase tracking-widest ${selectedProduct.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedProduct.stock > 0 ? 'En Stock' : 'Agotado'}
                   </p>
                   <p className="text-xs text-slate-500">{selectedProduct.stock} unidades disponibles</p>
                </div>
              </div>
              <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-sky-950/40 uppercase tracking-widest flex items-center justify-center gap-3">
                <ShoppingCart size={20} />
                Agregar al carrito
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Referencia</p>
                 <p className="font-mono text-sm text-slate-300">{selectedProduct.sku}</p>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase">Ubicación</p>
                 <p className="font-mono text-sm text-slate-300">{selectedProduct.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">MOTO-TECH SHOP</h1>
          <p className="text-slate-500 font-mono text-sm mt-2 tracking-widest">// REFACCIONARIA & ACCESORIOS PREMIUM</p>
        </div>
        <div className="flex-1 max-w-md w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar piezas, aceites..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-sky-500 transition-all font-semibold"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-900 rounded-3xl animate-pulse" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase italic tracking-widest">No se encontraron productos</div>
        ) : (
          filteredProducts.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProduct(p)}
              className="geometric-card flex flex-col group cursor-pointer hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-2 h-full"
            >
              <div className="aspect-square bg-slate-950 rounded-2xl mb-6 overflow-hidden relative shadow-inner">
                {p.primaryImage ? (
                  <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">No imagen</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <span className="text-xs font-bold text-white uppercase tracking-widest bg-sky-600 px-3 py-1 rounded-full">Ver Detalles</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{p.category}</span>
                  <span className="text-[10px] font-mono text-slate-600">{p.sku}</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors uppercase italic line-clamp-1">{p.name}</h3>
                
                <div className="flex justify-between items-end mt-auto pt-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="text-2xl font-black text-white italic tracking-tighter">${p.sellPrice}</div>
                  <button className="bg-slate-800 group-hover:bg-sky-600 text-white p-2 rounded-xl transition-colors shadow-lg">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="pt-20 border-t border-slate-900 text-center text-slate-600">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">MotoTech Pro © 2026 // Calidad en cada ensamble</p>
      </footer>
    </div>
  );
};
