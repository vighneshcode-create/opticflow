import React, { useState, useEffect } from 'react';
import { Customer, OrderItem, Order, Prescription, Product } from '../types';
import { ShoppingBag, Plus, Trash2, Tag, Percent, Calculator, X, Sparkles } from 'lucide-react';

interface NewBillingModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: Order) => void;
  products: Product[];
}

export default function NewBillingModal({
  customer,
  isOpen,
  onClose,
  onAddOrder,
  products = [],
}: NewBillingModalProps) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories' | 'Lenses'>('All');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Pending'>('UPI');
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Paid' | 'Delivered'>('Delivered');
  const [billingNotes, setBillingNotes] = useState('');
  
  // Custom non-inventory line items
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories'>('Specs');
  const [customItemPrice, setCustomItemPrice] = useState<number>(0);

  // Custom Lens Configurator states inside Billing Modal
  const [lensType, setLensType] = useState('Blue Cut / Blue Block');
  const [customLensText, setCustomLensText] = useState('');
  const [lensPrice, setLensPrice] = useState<number>(1200);

  const [lensPresetPrices, setLensPresetPrices] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('vision_eyecare_lens_preset_prices');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      'Blue Cut / Blue Block': 1200,
      'Blue Max Premium': 2850,
      'Anti-Glare (ARC Coating)': 900,
      'Photochromic (Transitions)': 3500,
      'Standard White (Hard Coat)': 600,
      'Progressive Lens Multi-focal': 4500
    };
  });

  const [isEditingPresetPrices, setIsEditingPresetPrices] = useState(false);

  useEffect(() => {
    localStorage.setItem('vision_eyecare_lens_preset_prices', JSON.stringify(lensPresetPrices));
  }, [lensPresetPrices]);

  const LENS_PRESETS = [
    { label: 'Blue Cut / Blue Block', info: 'Eye-strain protection' },
    { label: 'Blue Max Premium', info: 'Maximum high definition blue defense' },
    { label: 'Anti-Glare (ARC Coating)', info: 'Anti-reflection clear coating' },
    { label: 'Photochromic (Transitions)', info: 'Fades clear to dark in sunlight' },
    { label: 'Standard White (Hard Coat)', info: 'Basic scratch protection' },
    { label: 'Progressive Lens Multi-focal', info: 'Seamless near/distance corridor' }
  ];

  const handleAddCustomLens = () => {
    if (lensPrice <= 0) {
      alert('Please enter a valid lens selling price.');
      return;
    }
    const finalLensName = lensType === 'Custom' && customLensText.trim()
      ? `Lens: ${customLensText.trim()}`
      : `Lens: ${lensType}`;

    const newLensItem: OrderItem = {
      id: `lens-${Date.now()}`,
      name: finalLensName,
      category: 'Specs',
      price: lensPrice,
      quantity: 1,
    };

    setCart((prev) => [...prev, newLensItem]);
  };

  if (!isOpen) return null;

  // Filter products by category tab
  const productsToDisplay = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product, numQty = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === product.id);
      if (existing) {
        return prevCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + numQty } : i);
      }
      return [...prevCart, {
        id: product.id,
        name: product.name,
        category: product.category as any,
        price: product.price,
        quantity: numQty
      }];
    });
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || customItemPrice <= 0) return;
    
    const newItem: OrderItem = {
      id: `custom-${Date.now()}`,
      name: customItemName.trim(),
      category: customItemCategory,
      price: customItemPrice,
      quantity: 1
    };

    setCart(prev => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice(0);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round((subtotal - discountInput) * 0.18); // 18% standard GST computed
  const finalTotal = Math.max(0, subtotal - discountInput + tax);

  const handleFinalizeBill = () => {
    if (cart.length === 0) {
      alert('Please add at least one optical item to make a bill.');
      return;
    }

    // Get active/latest prescription index reference
    const associatedRxId = customer.prescriptions[0]?.id || undefined;

    const newOrder: Order = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      prescriptionId: associatedRxId,
      subtotal,
      discount: discountInput,
      tax,
      total: finalTotal,
      paymentMethod,
      status: orderStatus === 'Delivered' ? 'Delivered' : (orderStatus === 'Paid' ? 'Paid' : 'Pending') as any,
      notes: billingNotes.trim() || undefined
    };

    onAddOrder(newOrder);
    onClose();
  };

  return (
    <div id="new-billing-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div id="new-billing-modal" className="bg-[#FAF9F6] border border-[#E6E2D8] rounded-[2.5rem] w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-[#4A443E]">
        
        {/* Banner header bar */}
        <div id="modal-banner-header" className="px-8 py-5 bg-[#708271] text-white flex justify-between items-center shrink-0">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-mono bg-white/10 px-2 py-0.5 rounded text-[#E8E6E1]">E-Billing Gateway</span>
            <h3 id="billing-modal-title" className="text-xl font-bold font-serif">Compose Invoice for {customer.name}</h3>
          </div>
          <button
            id="close-billing-modal-x"
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content layout - left product selector, right Cart/Calculations */}
        <div id="billing-modal-main" className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left panel (Catalog & Category tabs) */}
          <div id="catalog-explorer" className="w-1/2 flex flex-col p-6 border-r border-[#E6E2D8] overflow-hidden">
            {/* Tabs */}
            <div id="catalog-category-tabs" className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
              {(['All', 'Specs', 'Goggles', 'Contact Lenses', 'Accessories', 'Lenses'] as const).map((cat) => (
                <button
                  id={`tab-category-${cat}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#708271] text-white border-transparent shadow-sm'
                      : 'bg-white border-[#E6E2D8] text-[#8A847C] hover:text-[#708271]'
                  }`}
                >
                  {cat === 'Lenses' ? '👓 Lens Configurator' : cat}
                </button>
              ))}
            </div>

            {/* List Products / Lens Configurator conditional block */}
            {selectedCategory === 'Lenses' ? (
              <div id="modal-lens-configurator-card" className="flex-1 bg-white p-5 rounded-[2rem] border border-[#E6E2D8] space-y-4 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-stone-100 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#708271]">Interactive Lens Configurator</span>
                    <p className="text-[11px] text-[#8A847C] mt-0.5">Pick an optical lens preset or configure custom specifications, then append to billing list.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPresetPrices((prev) => !prev)}
                    className="px-2.5 py-1 text-[10px] font-bold text-[#708271] border border-[#708271]/30 rounded-xl hover:bg-[#708271]/5 transition cursor-pointer"
                  >
                    {isEditingPresetPrices ? "Close Price Settings" : "Edit Preset Prices"}
                  </button>
                </div>

                {/* Editable Prices Panel */}
                {isEditingPresetPrices && (
                  <div className="p-4 bg-[#FAF9F6] border border-[#E6E2D8] rounded-2xl text-xs space-y-3 animate-in fade-in duration-200">
                    <p className="font-bold text-[11.5px] uppercase tracking-wider font-sans text-[#708271]">Configure Default Pricing of Lenses (₹)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {LENS_PRESETS.map((p) => (
                        <div key={p.label} className="flex justify-between items-center gap-2">
                          <span className="text-[11px] font-medium text-stone-600 truncate max-w-[150px]" title={p.label}>{p.label}</span>
                          <input
                            type="number"
                            min="0"
                            value={lensPresetPrices[p.label] === undefined ? 600 : lensPresetPrices[p.label]}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setLensPresetPrices((prev) => ({
                                ...prev,
                                [p.label]: val
                              }));
                            }}
                            className="w-20 px-2 py-1 bg-white border border-[#E6E2D8] rounded-lg font-mono text-center text-xs font-bold text-[#708271] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Presets Pills */}
                <div id="modal-preset-lens-row" className="grid grid-cols-2 gap-2">
                  {LENS_PRESETS.map((p) => {
                    const isActive = lensType === p.label;
                    const priceLabel = lensPresetPrices[p.label] === undefined ? 600 : lensPresetPrices[p.label];
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setLensType(p.label);
                          setLensPrice(priceLabel);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#708271]/5 border-[#708271] text-[#708271] shadow-xs'
                            : 'bg-white border-stone-200/80 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-sans font-bold text-[10px] leading-snug">{p.label}</p>
                          <span className="font-mono text-[9px] font-bold text-[#708271] shrink-0">₹{priceLabel}</span>
                        </div>
                        <p className="text-[8px] text-[#8a847c] mt-0.5 truncate leading-tight">{p.info}</p>
                      </button>
                    );
                  })}
                  
                  <button
                    type="button"
                    onClick={() => setLensType('Custom')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      lensType === 'Custom'
                        ? 'bg-[#708271]/5 border-[#708271] text-[#708271]'
                        : 'bg-white border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-sans font-bold text-[10px] leading-snug">Custom Option...</p>
                    <p className="text-[8px] text-[#8a847c] mt-0.5 leading-tight">Type custom specifications</p>
                  </button>
                </div>

                {/* Custom inputs */}
                <div id="modal-lens-inputs-row" className="grid grid-cols-12 gap-3 text-xs pt-1">
                  {lensType === 'Custom' && (
                    <div className="col-span-12 font-medium">
                      <label className="block text-stone-500 font-bold mb-1 text-[10px]">Custom Lens Specification Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Blue Block + Anti Fog Anti Smudge 1.67"
                        value={customLensText}
                        onChange={(e) => setCustomLensText(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                  )}
                  
                  <div className="col-span-12 sm:col-span-6 font-medium">
                    <label className="block text-stone-500 font-bold mb-1 text-[10px]">Selling Lens Billing Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={lensPrice || ''}
                      onChange={(e) => setLensPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl font-mono text-xs text-[#708271] font-bold"
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-6 self-end">
                    <button
                      type="button"
                      onClick={handleAddCustomLens}
                      className="w-full py-2 bg-[#708271] hover:bg-[#617162] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus size={12} /> Add Lens to Invoice
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div id="products-dynamic-grid" className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
                {productsToDisplay.map((p) => {
                  const isLowStock = p.stock <= 5;
                  return (
                    <div
                      id={`product-pick-card-${p.id}`}
                      key={p.id}
                      className="bg-white p-3 rounded-2xl border border-[#E6E2D8] flex flex-col justify-between hover:shadow-xs transition-shadow"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-[#8A847C]">{p.category}</span>
                          {isLowStock && (
                            <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-mono font-bold">LOW STOCK ({p.stock})</span>
                          )}
                        </div>
                        <h4 id={`product-name-lbl-${p.id}`} className="text-xs font-bold text-[#2D312E] mt-0.5 leading-tight font-serif h-8 overflow-hidden">{p.name}</h4>
                      </div>
                      <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-[#708271]">₹{p.price.toLocaleString('en-IN')}</span>
                        <button
                          id={`add-product-btn-${p.id}`}
                          type="button"
                          onClick={() => handleAddToCart(p, 1)}
                          className="p-1 px-2.5 bg-[#FAF9F6] border border-[#E6E2D8] text-[10px] font-bold rounded-lg hover:border-[#708271] hover:text-[#708271] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={10} /> Buy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Manual Item entry */}
            <form id="custom-item-row-form" onSubmit={handleAddCustomItem} className="mt-4 p-3 bg-white border border-[#E6E2D8] rounded-2xl shrink-0">
              <h5 className="text-[10px] font-bold uppercase text-[#8A847C] mb-2 font-mono">Custom Spec Lab Line / Off-Catalog Item</h5>
              <div className="grid grid-cols-12 gap-2 text-xs">
                <input
                  id="custom-item-name-input"
                  type="text"
                  required
                  placeholder="e.g. customized cylindrical power glass cut"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="col-span-5 px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none"
                />
                <select
                  id="custom-item-category-select"
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value as any)}
                  className="col-span-3 px-1 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none text-[11px]"
                >
                  <option value="Specs">Specs</option>
                  <option value="Goggles">Goggles</option>
                  <option value="Contact Lenses">Contact</option>
                  <option value="Accessories">Accessories</option>
                </select>
                <input
                  id="custom-item-price-input"
                  type="number"
                  placeholder="Price"
                  value={customItemPrice || ''}
                  onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                  className="col-span-2 px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none text-center font-mono"
                />
                <button
                  id="custom-item-add-btn"
                  type="submit"
                  className="col-span-2 bg-[#708271] text-white font-bold rounded-xl flex items-center justify-center.5 hover:bg-[#617162]"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Right panel (Cart list, totals, invoice settings) */}
          <div id="shopping-cart-payment-board" className="w-1/2 flex flex-col p-6 overflow-hidden bg-white">
            
            {/* Basket Items List */}
            <div id="cart-item-list" className="flex-1 overflow-y-auto min-h-0 border-b border-stone-100 pb-3">
              <h4 id="basket-title" className="text-xs font-bold uppercase tracking-wider text-[#708271] mb-2 flex items-center gap-1.5">
                <ShoppingBag size={14} /> Shop Invoice Basket
              </h4>
              
              {cart.length === 0 ? (
                <div id="cart-empty-message" className="h-40 flex flex-col justify-center items-center text-center text-xs text-[#8A847C] border border-dashed border-[#E6E2D8] rounded-2xl bg-[#FAF9F6] p-4">
                  <ShoppingBag size={24} className="mb-2 opacity-50 text-[#8A847C]" />
                  Empty Order Sheet. Click on any catalog items to append them.
                </div>
              ) : (
                <div id="cart-items-wrapper" className="space-y-2">
                  {cart.map((item) => (
                    <div id={`cart-row-${item.id}`} key={item.id} className="flex justify-between items-center p-3.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl flex-wrap">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[8px] uppercase font-mono px-1.5 py-0.1 bg-[#E8E6E1] rounded">{item.category}</span>
                        <p id={`cart-detail-name-${item.id}`} className="text-xs font-serif font-bold text-[#2D312E] truncate mt-0.5">{item.name}</p>
                        <p id={`cart-detail-price-${item.id}`} className="text-[10px] text-[#8A847C] font-mono">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <div id={`qty-adjuster-${item.id}`} className="flex items-center gap-2">
                        <input
                          id={`qty-raw-input-${item.id}`}
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQty(item.id, Number(e.target.value))}
                          className="w-10 text-center text-xs border border-[#E6E2D8] bg-white rounded font-mono p-0.5"
                        />
                        <button
                          id={`qty-trash-btn-${item.id}`}
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoicing Controls & Cash registers */}
            <div id="invoice-bill-calculations" className="shrink-0 pt-4 space-y-3.5 text-xs">
              
              {/* Discount parameter */}
              <div id="calc-discount-box" className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                  <Tag size={12} /> Apply Discount (₹)
                </span>
                <input
                  id="discount-cash-val-input"
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountInput || ''}
                  onChange={(e) => setDiscountInput(Number(e.target.value))}
                  className="w-24 text-right px-2 py-1 bg-[#FAF9F6] border border-[#E6E2D8] rounded-lg font-mono text-xs focus:ring-1 focus:ring-[#708271]"
                  placeholder="0"
                />
              </div>

              {/* Status and Method */}
              <div id="status-payment-configuration" className="grid grid-cols-2 gap-3">
                <div>
                  <label id="payment-method-lbl" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Mop / Method</label>
                  <select
                    id="payment-method-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs"
                  >
                    <option value="UPI">UPI (GooglePay/Paytm)</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Card">Visa/Mastercard Card</option>
                    <option value="Pending">Unpaid / Credit</option>
                  </select>
                </div>
                <div>
                  <label id="order-status-lbl" className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Dispatch Status</label>
                  <select
                    id="order-status-select"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs"
                  >
                    <option value="Delivered">Handed Over / Delivered</option>
                    <option value="Paid">Paid (Fitting in Progress)</option>
                    <option value="Pending">Pending (Draft / Unpaid)</option>
                  </select>
                </div>
              </div>

              {/* Mini bill-note */}
              <div>
                <input
                  id="billing-custom-memo"
                  type="text"
                  placeholder="Acutely tailored specifications, lens serials, frame models etc..."
                  value={billingNotes}
                  onChange={(e) => setBillingNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Calculation Sub-lines */}
              <div id="ledger-sub-lines" className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E6E2D8] space-y-1.5">
                <div className="flex justify-between items-center text-stone-500 font-medium">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{discountInput.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-stone-500 font-medium pb-2 border-b border-[#E6E2D8]">
                  <span>GST Taxes (18% Gp):</span>
                  <span className="font-mono">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#2D312E] pt-1">
                  <span className="font-serif">Grand Total Recieved:</span>
                  <span className="font-mono text-[#708271]">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                id="finalize-invoice-btn"
                onClick={handleFinalizeBill}
                disabled={cart.length === 0}
                className={`w-full py-3 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg ${
                  cart.length === 0
                    ? 'bg-stone-300 shadow-none cursor-not-allowed'
                    : 'bg-[#2D312E] hover:bg-[#1C1F1D] shadow-[#2D312E]/10'
                }`}
              >
                <Calculator size={14} /> Commit & Finalize E-Bill
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
