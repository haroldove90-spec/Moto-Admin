/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem } from '../types';
import { ShoppingCart, Search, Filter, ArrowLeft, Star, Trash2, X } from 'lucide-react';

interface CartItem extends InventoryItem {
  quantity: number;
}

export const ClientStore = ({ productId }: { productId?: string }) => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const WHATSAPP_NUMBER = "+525624222449";

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

  const addToCart = (product: InventoryItem) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => current.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = "Hola Moto-Tech Pro! Me gustaría realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
      message += `• ${item.name} (x${item.quantity}) - $${item.sellPrice * item.quantity}\n`;
    });
    message += `\n*TOTAL: $${cartTotal}*\n\nGracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedProduct) {
    return (
      <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Volver al catálogo
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-slate-900 border border-slate-800 rounded-full text-white hover:border-sky-500 transition"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative group">
              {selectedProduct.primaryImage ? (
                <img src={selectedProduct.primaryImage} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">No hay imagen</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full">{selectedProduct.category}</span>
              <h1 className="text-4xl font-black text-white mt-4 italic tracking-tighter uppercase">{selectedProduct.name}</h1>
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
              <button 
                onClick={() => addToCart(selectedProduct)}
                disabled={selectedProduct.stock <= 0}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-4 rounded-xl transition shadow-lg shadow-sky-950/40 uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <ShoppingCart size={20} />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        {isCartOpen && (
          <CartOverlay 
            cart={cart} 
            onClose={() => setIsCartOpen(false)} 
            onRemove={removeFromCart} 
            onUpdateQty={updateQuantity}
            onCheckout={handleCheckout}
            total={cartTotal}
          />
        )}
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
        <div className="flex items-center gap-4 flex-1 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar piezas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-sky-500 transition-all font-semibold"
            />
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white hover:border-sky-500 transition"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {loading ? (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-900 rounded-2xl animate-pulse" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase italic tracking-widest">No se encontraron productos</div>
        ) : (
          filteredProducts.map((p) => (
            <div 
              key={p.id} 
              className="geometric-card flex flex-col group cursor-pointer hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 h-full p-2 bg-slate-900 border border-slate-800 rounded-2xl"
            >
              <div onClick={() => setSelectedProduct(p)} className="aspect-square bg-slate-950 rounded-xl mb-3 overflow-hidden relative shadow-inner">
                {p.primaryImage ? (
                  <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800 text-[10px]">Sin imagen</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-sky-600 px-2 py-0.5 rounded-full">Ver Detalles</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col min-w-0">
                <h3 onClick={() => setSelectedProduct(p)} className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors uppercase italic line-clamp-2 leading-tight min-h-[2.5rem]">{p.name}</h3>
                
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-800/50">
                  <div className="text-sm font-black text-white italic tracking-tighter">${p.sellPrice}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-slate-800 hover:bg-sky-600 text-white p-1.5 rounded-lg transition-colors shadow-lg"
                  >
                    <ShoppingCart size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isCartOpen && (
        <CartOverlay 
          cart={cart} 
          onClose={() => setIsCartOpen(false)} 
          onRemove={removeFromCart} 
          onUpdateQty={updateQuantity}
          onCheckout={async () => {
            const saleData = {
              customer_id: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
              items: cart.reduce((acc, item) => ({ ...acc, [item.id]: { name: item.name, qty: item.quantity, price: item.sellPrice } }), {}),
              total_amount: cartTotal,
              profit: cart.reduce((acc, item) => acc + ((item.sellPrice - item.costPrice) * item.quantity), 0),
              sale_type: 'ONLINE_STORE',
              status: 'PENDING_WHATSAPP'
            };

            const { error } = await supabase.from('sales').insert([saleData]);
            if (error) console.error('Error recording sale:', error);
            
            handleCheckout();
          }}
          total={cartTotal}
        />
      )}

      <footer className="pt-20 border-t border-slate-900 text-center text-slate-600">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">MotoTech Pro © 2026 // Calidad en cada ensamble</p>
      </footer>

      {/* Floating Cart Button */}
      <div className="fixed bottom-8 right-8 z-[100] md:bottom-12 md:right-12">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="group relative bg-sky-600 hover:bg-sky-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(2,132,199,0.4)] transition-all transform hover:scale-110 active:scale-95"
        >
          <ShoppingCart size={28} className="group-hover:rotate-12 transition-transform" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-sky-600 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-xl border-2 border-sky-600 animate-in zoom-in">
              {cart.length}
            </span>
          )}
          <span className="absolute -top-12 right-0 bg-slate-900 border border-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ver Carrito (${cartTotal})
          </span>
        </button>
      </div>
    </div>
  );
};

const CartOverlay = ({ cart, onClose, onRemove, onUpdateQty, onCheckout, total }: any) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex justify-end">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Tu Carrito</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <ShoppingCart size={64} className="opacity-20" />
              <p className="font-bold uppercase italic tracking-widest">El carrito está vacío</p>
              <button 
                onClick={onClose}
                className="text-sky-500 hover:underline font-bold uppercase text-xs"
              >
                Seguir Comprando
              </button>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl group">
                <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.primaryImage} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase italic line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">${item.sellPrice} c/u</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 bg-slate-900 rounded-lg px-2 py-1 border border-slate-800">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="text-slate-400 hover:text-white">-</button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className="text-slate-400 hover:text-white">+</button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-slate-600 hover:text-rose-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/50 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 font-bold uppercase text-xs">Total del pedido</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">${total}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-emerald-950/40 uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Comprar por WhatsApp
            </button>
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
              * Serás redirigido para confirmar tu pedido
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
