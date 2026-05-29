import React, { useState, useEffect } from 'react';
import { Customer, OrderItem, Order, Prescription, Product } from '../types';
import { generateAndDownloadPdfBill } from '../utils/pdfGenerator';
import { ShoppingBag, Search, Plus, Trash2, Tag, Check, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

interface NewOrderPageProps {
  customers: Customer[];
  products: Product[];
  onPlaceExistingOrder: (customerId: string, order: Order) => void;
  onPlaceIntegratedOrder: (
    customerData: { name: string; mobile: string; email: string },
    prescriptionData: Prescription | null,
    orderData: Order
  ) => void;
  onNavigateToMain: () => void;
}

export default function NewOrderPage({
  customers,
  products,
  onPlaceExistingOrder,
  onPlaceIntegratedOrder,
  onNavigateToMain,
}: NewOrderPageProps) {
  const [orderMode, setOrderMode] = useState<'existing' | 'new'>('existing');

  // Existing Customer Select State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchExisting, setSearchExisting] = useState('');

  // New Customer Profile Form State
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // Eye Testing / Prescription Parameters (For New Customer Flow)
  const [hasPrescription, setHasPrescription] = useState(false);
  const [doctorName, setDoctorName] = useState('Kiran Shantaram Sanap');
  const [odSph, setOdSph] = useState('0.00');
  const [odCyl, setOdCyl] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [odAdd, setOdAdd] = useState('0.00');
  const [odVa, setOdVa] = useState('6/6');
  const [osSph, setOsSph] = useState('0.00');
  const [osCyl, setOsCyl] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [osAdd, setOsAdd] = useState('0.00');
  const [osVa, setOsVa] = useState('6/6');
  const [pd, setPd] = useState('63');
  const [rxNotes, setRxNotes] = useState('');

  // Item checkout lists (Cart)
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Pending'>('UPI');
  const [billingNotes, setBillingNotes] = useState('');

  // Lens custom picker
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

  // Filters
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchExisting.toLowerCase()) ||
      c.mobile.includes(searchExisting)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) &&
      p.category !== 'Specs' // Catalog focuses on frames / actual individual products, custom lens processed below
  );

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

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

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  // Billing math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = Math.round((cartSubtotal - discountAmount) * 0.18);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + estimatedTax);

  const handleResetForm = () => {
    setCart([]);
    setDiscountAmount(0);
    setBillingNotes('');
    setCustName('');
    setCustMobile('');
    setCustEmail('');
    setHasPrescription(false);
    setSelectedCustomerId('');
  };

  const handlePlaceOrderSubmit = () => {
    if (cart.length === 0) {
      alert('Your purchase basket is empty! Please add frames or standard lens configurations.');
      return;
    }

    const orderId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const rxId = hasPrescription || (orderMode === 'existing' && selectedCustomer?.prescriptions[0])
      ? `rx-${Date.now()}`
      : undefined;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      prescriptionId: rxId,
      subtotal: cartSubtotal,
      discount: discountAmount,
      tax: estimatedTax,
      total: cartTotal,
      paymentMethod,
      status: paymentMethod === 'Pending' ? 'Pending' : 'Delivered',
      notes: billingNotes.trim() || undefined,
    };

    if (orderMode === 'existing') {
      if (!selectedCustomerId) {
        alert('Please select an existing patient directory to link this order.');
        return;
      }
      onPlaceExistingOrder(selectedCustomerId, newOrder);
      
      const assocCustomer = customers.find((c) => c.id === selectedCustomerId);
      if (assocCustomer) {
        const associatedRx = assocCustomer.prescriptions[0] || undefined;
        generateAndDownloadPdfBill(assocCustomer, newOrder, associatedRx);
      }
      alert(`Successfully registered order #${orderId} for ${selectedCustomer?.name || 'Customer'}. Receipt compiled!`);
      onNavigateToMain();
    } else {
      // New Customer Flow
      if (!custName.trim() || !custMobile.trim()) {
        alert('Please fill out the patient name and 10-digit mobile number.');
        return;
      }

      let compiledRx: Prescription | null = null;
      if (hasPrescription) {
        compiledRx = {
          id: rxId!,
          date: new Date().toISOString().split('T')[0],
          doctorName,
          odSph,
          odCyl,
          odAxis,
          odAdd,
          odVa,
          osSph,
          osCyl,
          osAxis,
          osAdd,
          osVa,
          pd,
          notes: rxNotes.trim() || 'Custom billing-time lens configuration test completed.',
          lensRecommended: lensType,
          lensPrice: lensPrice,
        };
      }

      onPlaceIntegratedOrder(
        { name: custName.trim(), mobile: custMobile.trim(), email: custEmail.trim() },
        compiledRx,
        newOrder
      );

      // Trigger automatic PDF billing download
      const tempCustomerMock: Customer = {
        id: 'cust-temp',
        name: custName.trim(),
        mobile: custMobile.trim(),
        email: custEmail.trim(),
        customerSince: 'Today',
        prescriptions: compiledRx ? [compiledRx] : [],
        orders: [newOrder],
      };
      generateAndDownloadPdfBill(tempCustomerMock, newOrder, compiledRx || undefined);

      alert(`Successfully signs up patient ${custName}, records eye power tests, and compiled invoice receipt #${orderId}!`);
      handleResetForm();
      onNavigateToMain();
    }
  };

  return (
    <div id="new-order-panel-container" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Upper header */}
      <div id="new-order-screen-head" className="border-b border-[#E6E2D8] pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 id="new-order-main-title" className="text-2xl font-bold font-serif text-[#2D312E] tracking-tight">Consolidated Ophthalmic Order Engine</h2>
          <p id="new-order-subtitle" className="text-sm text-[#8A847C] mt-1">Place sales and diagnostics records seamlessly. Select between existing ledger profiles or register brand-new clients on the fly.</p>
        </div>
        
        {/* Toggle Mode Control pills */}
        <div id="order-mode-toggles" className="flex bg-[#E8E6E1]/70 p-1.5 border border-[#E6E2D8] rounded-xl text-xs font-bold gap-1">
          <button
            id="toggle-existing-mode-btn"
            onClick={() => { setOrderMode('existing'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              orderMode === 'existing'
                ? 'bg-white text-[#708271] shadow-xs'
                : 'text-[#8A847C] hover:text-[#4A443E]'
            }`}
          >
            <UserCheck size={14} /> Existing Patient
          </button>
          <button
            id="toggle-new-mode-btn"
            onClick={() => { setOrderMode('new'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              orderMode === 'new'
                ? 'bg-white text-[#708271] shadow-xs'
                : 'text-[#8A847C] hover:text-[#4A443E]'
            }`}
          >
            <Plus size={14} /> Register & Place Order (Unified Step)
          </button>
        </div>
      </div>

      <div id="new-order-canvas-grid" className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left column (7 columns): Patient context and Lens customized pickers */}
        <div id="left-setup-column" className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* Section A: Customer Selector or Registration Data */}
          {orderMode === 'existing' ? (
            <div id="existing-patient-link-card" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] space-y-4">
              <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#708271]">Section 1: Locate Active Patient</span>
              
              <div className="flex gap-3">
                <div className="relative flex-1 text-xs">
                  <input
                    id="order-existing-search"
                    type="text"
                    placeholder="Search by patient name or mobile phone..."
                    value={searchExisting}
                    onChange={(e) => setSearchExisting(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A847C]" />
                </div>
                
                {selectedCustomerId && (
                  <button
                    onClick={() => setSelectedCustomerId('')}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl text-xs font-mono transition-all"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {!selectedCustomerId ? (
                <div id="existing-patient-result-list" className="border border-stone-100 rounded-2xl max-h-[170px] overflow-y-auto space-y-1.5 p-2 bg-[#FAF9F6]/50">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-center py-6 text-stone-400 text-xs font-mono">No customers found matching that query.</p>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className="w-full text-left p-2.5 bg-white border border-stone-100 hover:border-[#708271]/40 rounded-xl flex justify-between items-center transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-serif font-bold text-[#2D312E]">{cust.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">{cust.mobile} • since {cust.customerSince}</p>
                        </div>
                        <Check size={14} className="text-stone-300" />
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div id="existing-joined-card" className="p-4 bg-[#708271]/5 border border-[#708271]/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#708271] text-white rounded-xl flex items-center justify-center font-serif font-extrabold text-sm uppercase">
                      {selectedCustomer?.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-serif font-bold text-[#2D312E]">{selectedCustomer?.name}</p>
                      <p className="text-[10px] text-[#8A847C] font-mono">{selectedCustomer?.mobile} • {selectedCustomer?.email || 'No email registered'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded font-mono uppercase flex items-center gap-1">
                    <Check size={10} /> Profile Selected
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div id="new-patient-register-card" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] space-y-5">
              <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#708271]">Section 1: Register New profile details</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs font-medium">
                <div className="sm:col-span-4">
                  <label className="block text-stone-500 font-bold mb-1">Full Ophthalmic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                </div>
                
                <div className="sm:col-span-4">
                  <label className="block text-stone-500 font-bold mb-1">10-Digit Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none font-mono"
                  />
                </div>
                
                <div className="sm:col-span-4">
                  <label className="block text-stone-500 font-bold mb-1">Email ID</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Eye diagnostic entry checkmark */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="checkbox-has-prescription"
                    type="checkbox"
                    checked={hasPrescription}
                    onChange={(e) => setHasPrescription(e.target.checked)}
                    className="w-4 h-4 accent-[#708271]"
                  />
                  <label htmlFor="checkbox-has-prescription" className="text-xs font-bold text-[#2D312E] select-none">
                    Write Eye Refraction Prescription values for this patient
                  </label>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-stone-100 rounded text-stone-500 font-mono font-bold">Recommended</span>
              </div>

              {hasPrescription && (
                <div id="embedded-raw-rx-setup" className="p-4 bg-[#FAF9F6] border border-stone-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center border-b border-stone-200/50 pb-2">
                    <span className="text-[10px] font-bold text-[#708271] uppercase tracking-wide">Refract Dioptric Grid parameters</span>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans">
                      <label className="font-bold">Practitioner / Doctor Name:</label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="bg-white border border-[#E6E2D8] rounded px-2 py-0.5 w-32 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* OD Grid */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-extrabold text-[#708271] uppercase tracking-wider font-mono">OD (Right Eye Oculus Dexter)</p>
                    <div className="grid grid-cols-5 gap-2 text-xs text-center font-mono">
                      <div>
                        <label className="block text-[9px] text-stone-400">SPHERICAL</label>
                        <input type="text" value={odSph} onChange={(e) => setOdSph(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">CYLINDRICAL</label>
                        <input type="text" value={odCyl} onChange={(e) => setOdCyl(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">AXIS</label>
                        <input type="text" value={odAxis} onChange={(e) => setOdAxis(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">ADDITION</label>
                        <input type="text" value={odAdd} onChange={(e) => setOdAdd(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">ACUITY (VA)</label>
                        <input type="text" value={odVa} onChange={(e) => setOdVa(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                    </div>
                  </div>

                  {/* OS Grid */}
                  <div className="space-y-1.5 pt-1.5 border-t border-dashed border-stone-200">
                    <p className="text-[10px] font-extrabold text-[#708271] uppercase tracking-wider font-mono">OS (Left Eye Oculus Sinister)</p>
                    <div className="grid grid-cols-5 gap-2 text-xs text-center font-mono">
                      <div>
                        <label className="block text-[9px] text-stone-400">SPHERICAL</label>
                        <input type="text" value={osSph} onChange={(e) => setOsSph(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">CYLINDRICAL</label>
                        <input type="text" value={osCyl} onChange={(e) => setOsCyl(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">AXIS</label>
                        <input type="text" value={osAxis} onChange={(e) => setOsAxis(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">ADDITION</label>
                        <input type="text" value={osAdd} onChange={(e) => setOsAdd(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-stone-400">ACUITY (VA)</label>
                        <input type="text" value={osVa} onChange={(e) => setOsVa(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-1.5 border-t border-dashed border-stone-200">
                    <div>
                      <label className="block text-[10px] text-stone-500 font-bold uppercase mb-1">Pupil Distance (PD mm) *</label>
                      <input type="text" value={pd} onChange={(e) => setPd(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-[#E6E2D8] rounded-xl font-mono text-center" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-stone-500 font-bold uppercase mb-1">Ophthalmic Recommendation Notes</label>
                      <input type="text" placeholder="e.g. computer glasses fitted clear" value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-[#E6E2D8] rounded-xl" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section B: Lens parameters config (Add one option for lens type blue block, blue max, antiglare, etc . and price for lens) */}
          <div id="lens-configurator-card" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100 flex-wrap gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#708271]">Section 2: Vision Eye Care Lens configurator</span>
                <p className="text-xs text-[#8A847C] mt-0.5">Customize specific optical lens types and custom lab pricing to append to shopping list.</p>
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
                <p className="font-bold text-[11px] uppercase tracking-wider font-sans text-[#708271]">Configure Default Pricing of Lenses (₹)</p>
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
                <p className="text-[9px] text-stone-400 italic">Adjusting these values updates the quick-select preset pricing instantly across diagnostic sessions.</p>
              </div>
            )}

            {/* Quick Presets Pills */}
            <div id="preset-lens-row" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                      <p className="font-sans font-bold text-[11px] leading-snug">{p.label}</p>
                      <span className="font-mono text-[9px] font-bold text-[#708271] shrink-0">₹{priceLabel}</span>
                    </div>
                    <p className="text-[9px] text-[#8a847c] mt-0.5 truncate leading-tight">{p.info}</p>
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
                <p className="font-sans font-bold text-[11px] leading-snug">Custom Option...</p>
                <p className="text-[9px] text-[#8a847c] mt-0.5 leading-tight">Type custom specifications</p>
              </button>
            </div>

            {/* Custom inputs */}
            <div id="lens-inputs-row" className="grid grid-cols-12 gap-3 text-xs pt-1">
              {lensType === 'Custom' && (
                <div className="col-span-12 sm:col-span-6 font-medium">
                  <label className="block text-stone-500 font-bold mb-1">Custom Lens Specification Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue Block + Anti Fog Anti Smudge 1.67"
                    value={customLensText}
                    onChange={(e) => setCustomLensText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none"
                  />
                </div>
              )}
              
              <div className={lensType === 'Custom' ? "col-span-12 sm:col-span-4" : "col-span-12 sm:col-span-8"}>
                <label className="block text-stone-500 font-bold mb-1">Selling Lens Billing Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={lensPrice || ''}
                  onChange={(e) => setLensPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl font-mono text-sm text-[#708271] font-bold"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 self-end">
                <button
                  type="button"
                  onClick={handleAddCustomLens}
                  className="w-full py-2 bg-[#708271] hover:bg-[#617162] text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-[#708271]/15 cursor-pointer"
                >
                  <Plus size={13} /> Add Lens to Basket
                </button>
              </div>
            </div>
          </div>

          {/* Section C: Product catalog selector */}
          <div id="catalog-frames-card" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#708271]">Section 3: Add Frame or Accessory Product</span>
                <p className="text-xs text-[#8A847C] mt-0.5">Click "Buy" to insert any standard item from store physical stock inventory list.</p>
              </div>
              <div className="relative text-xs w-48">
                <input
                  type="text"
                  placeholder="Filter stock catalog..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= 5;
                return (
                  <div key={p.id} className="p-3 bg-stone-50/50 border border-stone-100 rounded-xl hover:border-stone-200 transition flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] font-mono text-[#8a847c] uppercase tracking-wider">{p.category}</p>
                      <h4 className="text-[11px] font-bold text-[#2d312e] font-serif leading-tight mt-0.5 truncate" title={p.name}>{p.name}</h4>
                      {isLowStock && (
                        <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded inline-block font-mono mt-1 font-bold">STOCK: {p.stock}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-stone-200/50">
                      <span className="font-mono font-bold text-[11px] text-[#708271]">₹{p.price.toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="p-1 px-2.5 bg-white border border-stone-200 text-[10px] font-sans font-bold hover:border-[#708271] hover:text-[#708271] rounded-lg transition"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column (5 columns): Sale basket, payments & receipt generation summary */}
        <div id="right-basket-column" className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* Main invoice sheet card */}
          <div id="invoice-sheet-card" className="bg-white p-6 rounded-[2.5rem] border border-[#E6E2D8] shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#708271] flex items-center gap-1">
                  <ShoppingBag size={12} /> Live Invoice basket
                </span>
                <span className="text-[10px] bg-[#FAF9F6] border border-stone-200 rounded px-2 py-0.5 font-mono text-stone-500 font-bold">
                  {cart.length} items added
                </span>
              </div>

              {cart.length === 0 ? (
                <div id="order-cart-empty-state" className="h-44 border border-dashed border-[#E6E2D8] rounded-3xl flex flex-col justify-center items-center text-center p-6 bg-[#FAF9F6]/40 text-stone-400">
                  <ShoppingBag size={32} className="opacity-40 mb-2" />
                  <p className="text-xs font-bold font-sans">Invoice basket is completely empty.</p>
                  <p className="text-[10px] text-stone-400 mt-1">Configure custom lenses or pick products above to populate checkout invoice.</p>
                </div>
              ) : (
                <div id="checkout-cart-items" className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 bg-[#FAF9F6]/80 border border-stone-100 hover:border-stone-200 transition rounded-xl flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className="text-[8px] uppercase tracking-wider bg-stone-100 font-mono font-bold px-1.5 py-0.2 rounded text-stone-600">{item.category}</span>
                        <h4 className="font-serif font-bold text-[#2D312E] truncate mt-0.5">{item.name}</h4>
                        <p className="text-[10px] font-mono text-[#708271]">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQty(item.id, parseInt(e.target.value) || 0)}
                          className="w-10 text-center py-0.5 font-mono border border-stone-200 rounded text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoicing mathematical variables */}
              {cart.length > 0 && (
                <div id="invoice-bill-calculations" className="space-y-2 pt-4 border-t border-stone-100 text-xs mt-4">
                  <div className="flex justify-between items-center text-stone-500 font-medium">
                    <span>Invoice Subtotal</span>
                    <span className="font-mono text-stone-700">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-4 text-stone-500">
                    <span className="flex items-center gap-1 uppercase text-[10px] tracking-wider text-stone-400">
                      <Tag size={11} /> Discount Deduction (₹)
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={cartSubtotal}
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      className="w-24 text-right px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded font-mono text-[11px]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center text-stone-500 font-medium">
                    <span className="font-sans text-[10px] tracking-wide text-stone-400">CGST + SGST (18% inclusive mapping)</span>
                    <span className="font-mono text-stone-700">₹{estimatedTax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl flex justify-between items-center text-xs mt-2 font-bold font-sans">
                    <span className="text-[#4A443E]">Final Checkout Total</span>
                    <span className="font-mono text-[#708271] text-base">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Payment methods picker */}
              <div id="payment-gate-selection" className="space-y-2 mt-4 text-xs">
                <label className="block text-stone-500 font-bold uppercase text-[9px] tracking-wider">Payment ledger channel</label>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                  {(['UPI', 'Cash', 'Card', 'Pending'] as const).map((method) => {
                    const isActive = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#708271] text-white border-transparent'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Billing generic metadata notes */}
              <div className="space-y-1 mt-4 text-xs">
                <label className="block text-stone-500 font-bold uppercase text-[9px] tracking-wider">Billing Invoice Notes (Receipt Comment)</label>
                <input
                  type="text"
                  placeholder="e.g. Frame size 54; delivered in 2 business days"
                  value={billingNotes}
                  onChange={(e) => setBillingNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Invoicing deployment submission buttons */}
            <div id="checkout-drawer-submit-row" className="pt-6 border-t border-stone-100 mt-6 space-y-2">
              <button
                type="button"
                onClick={handlePlaceOrderSubmit}
                disabled={orderMode === 'existing' && !selectedCustomerId}
                className="w-full py-3 bg-[#2D312E] hover:bg-black text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2D312E]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} /> Place Ophthalmic Order & Compile PDF
              </button>
              
              <button
                type="button"
                onClick={onNavigateToMain}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs uppercase rounded-xl text-center"
              >
                Return to Clinic Dashboard
              </button>
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
}
