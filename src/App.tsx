import React, { useState, useEffect } from 'react';
import { Customer, Prescription, Order, Product, MonthlyExpense } from './types';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_EXPENSES } from './initialData';
import CustomerSelector from './components/CustomerSelector';
import PrescriptionHistory from './components/PrescriptionHistory';
import OrderHistory from './components/OrderHistory';
import NewBillingModal from './components/NewBillingModal';
import NewCustomerPage from './components/NewCustomerPage';
import StockInventoryPage from './components/StockInventoryPage';
import FinancialsPage from './components/FinancialsPage';
import RecordsPage from './components/RecordsPage';
import NewOrderPage from './components/NewOrderPage';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Layout, 
  Search, 
  Package, 
  TrendingUp, 
  UserPlus, 
  BookOpen,
  Building,
  User,
  ShoppingCart,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Settings
} from 'lucide-react';
import { getStoreSettings, saveStoreSettings, StoreSettings } from './utils/storeSettings';

export default function App() {
  // Load state from local storage or fallback to initial diagnostic ledger
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem('opticflow_customers_ledger');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading custom local storage schema. Seeding fallback ledger instead.', e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('opticflow_products_catalog');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading products storage.', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [expenses, setExpenses] = useState<MonthlyExpense[]>(() => {
    try {
      const stored = localStorage.getItem('opticflow_monthly_expenses');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading expenses storage.', e);
    }
    return INITIAL_EXPENSES;
  });

  const [activeCustomerId, setActiveCustomerId] = useState<string>('');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'records' | 'new_customer' | 'new_order' | 'inventory' | 'financials' | 'settings'>('main');

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getStoreSettings());

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setStoreSettings(getStoreSettings());
    };
    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('store_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Logo uploader state
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('vision_eyecare_custom_logo') || null;
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomLogo(base64);
        localStorage.setItem('vision_eyecare_custom_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Logo',
      message: 'Reset logo to default Vision Eye Care digital medical emblem?',
      onConfirm: () => {
        setCustomLogo(null);
        localStorage.removeItem('vision_eyecare_custom_logo');
        setConfirmState(null);
      }
    });
  };

  // Deletion Handlers based on User request ("keep an option for deleting order of customer, old stock, customer, etc.")
  const handleDeleteCustomer = (customerId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Customer Dossier',
      message: 'Are you sure you want to delete this customer? This will PERMANENTLY remove all their visual prescriptions and complete purchase invoicing history from the 10-year store archive.',
      onConfirm: () => {
        setCustomers((prev) => {
          const nextCustomers = prev.filter((c) => c.id !== customerId);
          if (activeCustomerId === customerId) {
            setActiveCustomerId(nextCustomers[0]?.id || '');
          }
          return nextCustomers;
        });
        setConfirmState(null);
      }
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Invoice Transaction',
      message: `Are you sure you want to delete invoice transaction #${orderId} from the patient registry history?`,
      onConfirm: () => {
        setCustomers((prev) =>
          prev.map((c) => ({
            ...c,
            orders: c.orders.filter((o) => o.id !== orderId),
          }))
        );
        setConfirmState(null);
      }
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Catalog Product',
      message: `Are you sure you want to delete this product SKU #${productId} from the Vision Eye Care stock inventory catalog?`,
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setConfirmState(null);
      }
    });
  };

  const handlePlaceExistingOrder = (customerId: string, order: Order) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            orders: [order, ...c.orders],
          };
        }
        return c;
      })
    );

    // Stock deduction
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemOrdered = order.items.find((item) => item.id === p.id || item.name === p.name);
        if (itemOrdered) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemOrdered.quantity),
          };
        }
        return p;
      })
    );
  };

  const handlePlaceIntegratedOrder = (
    customerData: { name: string; mobile: string; email: string },
    prescriptionData: Prescription | null,
    orderData: Order
  ) => {
    const newCustomerId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: newCustomerId,
      name: customerData.name,
      mobile: customerData.mobile,
      email: customerData.email,
      customerSince: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
      prescriptions: prescriptionData ? [prescriptionData] : [],
      orders: [orderData],
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setActiveCustomerId(newCustomerId);

    // Stock deduction
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemOrdered = orderData.items.find((item) => item.id === p.id || item.name === p.name);
        if (itemOrdered) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemOrdered.quantity),
          };
        }
        return p;
      })
    );
  };

  // Save updates back to LocalStorage to support stability
  useEffect(() => {
    localStorage.setItem('opticflow_customers_ledger', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('opticflow_products_catalog', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('opticflow_monthly_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Keyboard shortcut listener keys F1, F2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsBillingOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeCustomer = customers.find((c) => c.id === activeCustomerId) || customers[0] || null;

  // Handler for adding a new customer
  const handleAddCustomer = (name: string, mobile: string, email: string) => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      mobile,
      email,
      customerSince: `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`,
      prescriptions: [],
      orders: [],
    };
    
    setCustomers((prev) => [newCustomer, ...prev]);
    setActiveCustomerId(newCustomer.id);
  };

  // Handler to add a brand new prescription to active customer
  const handleAddPrescription = (prescription: Prescription) => {
    if (!activeCustomer) return;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === activeCustomer.id) {
          return {
            ...c,
            prescriptions: [prescription, ...c.prescriptions],
          };
        }
        return c;
      })
    );
  };

  // Handler to append a finalize order bill to active customer
  const handleAddOrder = (order: Order) => {
    if (!activeCustomer) return;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === activeCustomer.id) {
          return {
            ...c,
            orders: [order, ...c.orders],
          };
        }
        return c;
      })
    );

    // Dynamic stock deductions
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemOrdered = order.items.find((item) => item.id === p.id || item.name === p.name);
        if (itemOrdered) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemOrdered.quantity),
          };
        }
        return p;
      })
    );
  };

  // Handler to update status (pending/delivered/paid)
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    if (!activeCustomer) return;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === activeCustomer.id) {
          return {
            ...c,
            orders: c.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
          };
        }
        return c;
      })
    );
  };

  // Handler to add a new inventory product catalog line
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Handler to replenish specific stock items
  const handleUpdateProductStock = (productId: string, quantityToAdd: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: p.stock + quantityToAdd,
            initialStockBought: p.initialStockBought + quantityToAdd, // adding to purchased spends
          };
        }
        return p;
      })
    );
  };

  // Handler to append a monthly expense bill to logistics ledger
  const handleAddExpense = (newExpense: MonthlyExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  // Quick stats calculations for active customer
  const totalVisits = (activeCustomer?.prescriptions.length || 0) + (activeCustomer?.orders.length || 0);
  const totalInvoicedAmount = activeCustomer?.orders.reduce((sum, o) => sum + o.total, 0) || 0;
  
  return (
    <div id="opticflow-app-shell" className="flex h-screen w-screen bg-[#FAF9F6] text-[#4A443E] font-sans overflow-hidden">
      
      {/* LEFT MOST BAR: GLOBAL SHOP CHROMATIC LOGO & MENU SELECTION */}
      <div id="global-navigation-drawer" className="w-64 shrink-0 bg-[#F2F0EB] border-r border-[#E6E2D8] flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Shop branding head with custom spectacles shop logo */}
          <div className="p-6 border-b border-[#E6E2D8] flex flex-col gap-3">
            <div className="flex items-center gap-2 relative">
              <label htmlFor="logo-uploader-sidebar" className="cursor-pointer relative block shrink-0">
                {customLogo ? (
                  <img
                    src={customLogo}
                    alt="Vision Eye Care Logo"
                    className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-[#E6E2D8]"
                    title="Click to select another store logo image"
                  />
                ) : (
                  <div className="bg-[#708271] w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#708271]/25 hover:bg-[#617162] transition-colors" title="Click to upload store logo">
                    {/* Real Recognizable Spectacles Vector Glasses Logo */}
                    <svg viewBox="0 0 100 40" className="h-6 w-auto" fill="none" stroke="currentColor" strokeWidth="4">
                      <circle cx="26" cy="20" r="14" />
                      <circle cx="74" cy="20" r="14" />
                      <path d="M40 20 C50 12, 50 12, 60 20" strokeLinecap="round" />
                      <path d="M12 20 L4 20" strokeLinecap="round" />
                      <path d="M88 20 L96 20" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <input
                  id="logo-uploader-sidebar"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h1 className="text-sm font-bold tracking-tight text-[#2D312E] truncate" style={{ fontFamily: 'Georgia, serif' }}>{storeSettings.storeName}</h1>
                  {customLogo && (
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      className="text-[8px] text-red-500 hover:text-red-700 font-bold underline font-sans"
                      title="Reset to default"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-[#8A847C] uppercase tracking-wider font-bold">Specs Store & Clinic</p>
              </div>
            </div>
          </div>

          <span className="px-6 pt-5 pb-1 text-[9px] uppercase tracking-widest text-[#8A847C] font-mono font-bold">Menu Navigation</span>
          
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('main')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'main'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <Layout size={14} />
              Main Console
            </button>
            <button
              onClick={() => setActiveTab('new_order')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'new_order'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <ShoppingCart size={14} className="text-amber-600" />
              New Order (POS)
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <BookOpen size={14} />
              Records Archive
            </button>
            <button
              onClick={() => setActiveTab('new_customer')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'new_customer'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <UserPlus size={14} />
              New Customer
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <Package size={14} />
              Products & Stock
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <TrendingUp size={14} />
              Income & Profits
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all justify-start outline-none cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white border border-[#E6E2D8] text-[#708271] shadow-xs font-extrabold font-extrabold'
                  : 'text-[#8A847C] hover:bg-white/50 hover:text-[#4A443E]'
              }`}
            >
              <Settings size={14} className="text-stone-500" />
              Clinic Settings
            </button>
          </nav>
        </div>

        {/* Brand foot panel */}
        <div className="p-4 border-t border-[#E6E2D8] bg-[#E8E6E1]/50 text-[10px] text-[#8a847c] font-mono flex items-center justify-between font-bold">
          <span>STABLE 10-YR ARCHIVE</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
        </div>
      </div>

      {/* PORTFOLIO VIEWPORT AREA */}
      <div id="dynamic-view-viewport" className="flex-1 h-full overflow-hidden flex flex-col bg-[#FAF9F6]">
        {activeTab === 'main' && (
          <div className="flex-1 flex min-w-0 overflow-hidden h-full">
            {/* Left Sidebar Navigation / Customer selector Panel inside main view */}
            <CustomerSelector
              customers={customers}
              activeCustomer={activeCustomer}
              onSelectCustomer={(c) => setActiveCustomerId(c.id)}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />

            {/* Right Main Working Console Area */}
            <main id="main-working-console" className="flex-1 flex flex-col min-w-0 p-8 h-full overflow-y-auto">
              {/* Top Header Row with clinic and practitioner card */}
              <header id="clinical-header-row" className="flex justify-between items-center mb-8 shrink-0 pb-4 border-b border-[#E6E2D8]/60">
                <div>
                  <h2 id="practitioner-clinic-heading" className="text-xl font-bold font-serif text-[#2D312E] flex items-center gap-2">
                    <Building2 className="text-[#708271]" size={20} />
                    {storeSettings.storeName} Diagnostic Console
                  </h2>
                  <p id="practitioner-date-subtitle" className="text-xs text-[#8A847C] mt-0.5">
                    Clinical Refraction & Optical Retail Console
                  </p>
                </div>

                <div id="practitioner-meta-card" className="flex items-center gap-3">
                  <span className="text-right">
                    <p id="practitioner-title" className="text-xs font-bold text-[#2D312E]">{storeSettings.practitionerName}</p>
                    <p id="practitioner-subtitle" className="text-[10px] text-[#8A847C] uppercase tracking-wider font-semibold font-sans">{storeSettings.practitionerTitle}</p>
                  </span>
                  <div id="practitioner-avatar" className="w-9 h-9 rounded-full bg-[#708271] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {storeSettings.practitionerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'OP'}
                  </div>
                </div>
              </header>

              {/* Selected Customer Dashboard layout columns */}
              {activeCustomer ? (
                <div id="clinical-dashboard-body" className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                  
                  {/* Left Hand Column: Demographics & Clinical Prescription Ledger (5 cols) */}
                  <div id="left-diagnostic-column" className="col-span-12 xl:col-span-5 flex flex-col gap-6">
                    
                    {/* Demographics Details Card */}
                    <div id="demographics-card" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] flex flex-col justify-between shrink-0 shadow-xs">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 id="demographics-type-title" className="text-[10px] font-bold uppercase tracking-wider text-[#708271]">Primary Patient Metadata</h3>
                          <button
                            type="button"
                            onClick={() => setActiveCustomerId('')}
                            className="p-1.5 hover:bg-[#FAF9F6] text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
                            title="Close Patient File (Keep Plain Console)"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div id="demographics-gender-badge" className="w-14 h-14 rounded-2xl bg-[#F2F0EB] flex items-center justify-center text-xl font-serif text-[#708271] font-bold uppercase transition">
                            {activeCustomer.name.substring(0, 2)}
                          </div>
                          <div>
                            <h4 id="patient-brand-name" className="text-lg font-bold text-[#2D312E] font-serif leading-snug">{activeCustomer.name}</h4>
                            <p id="patient-interactive-phone" className="text-xs text-[#8A847C] font-mono mt-0.5">{activeCustomer.mobile}</p>
                          </div>
                        </div>
                      </div>

                      <div id="patient-stats-grid" className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E2D8]/50">
                          <p className="text-[#8A847C] text-[10px] font-semibold">Registered Since</p>
                          <p className="font-bold text-[#202020] font-mono mt-0.5">{activeCustomer.customerSince}</p>
                        </div>
                        <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E2D8]/50">
                          <p className="text-[#8A847C] text-[10px] font-semibold font-sans">Accumulated Sales</p>
                          <p className="font-bold text-[#708271] font-mono mt-0.5">₹{activeCustomer.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div id="clinical-quick-reminder" className="mt-4 p-3 bg-[#E8E6E1]/30 border border-[#E6E2D8]/60 rounded-xl text-[11px] text-stone-600 flex items-center gap-1.5 font-sans leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-[#708271] rounded-full shrink-0"></span>
                        Patient has {activeCustomer.prescriptions.length} diagnostic charts and {activeCustomer.orders.length} custom billing items logged over the years.
                      </div>
                    </div>

                    {/* Eye Prescriptions timeline history card */}
                    <div id="diagnostic-timeline-card" className="flex-1">
                      <PrescriptionHistory
                        customer={activeCustomer}
                        onAddPrescription={handleAddPrescription}
                      />
                    </div>

                  </div>

                  {/* Right Hand Column: Previous orders table and billing action (7 cols) */}
                  <div id="right-billing-column" className="col-span-12 xl:col-span-7 flex flex-col gap-6">
                    
                    {/* Order Lists card */}
                    <div id="orders-list-parent-wrapper" className="flex-1">
                      <OrderHistory
                        customer={activeCustomer}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                        onDeleteOrder={handleDeleteOrder}
                      />
                    </div>

                    {/* Direct billing shortcut footer trigger */}
                    <div id="billing-shortcut-footer" className="bg-[#E8E6E1] p-4 rounded-[2rem] flex justify-between items-center shrink-0 border border-[#E6E2D8]">
                      <div className="text-xs">
                        <p className="font-bold text-[#2D312E] font-serif">Diagnostic-driven Optical Invoicing</p>
                        <p className="text-[#8A847C] text-[10px] mt-0.5">Trigger standard specifications invoice containing prescription mapping. (Shortkey: F2)</p>
                      </div>
                      
                      <button
                        id="direct-open-billing-modal-btn"
                        onClick={() => setIsBillingOpen(true)}
                        className="px-6 py-3 bg-[#2D312E] text-white hover:bg-black font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#2D312E]/10 transition-colors cursor-pointer"
                      >
                        <Sparkles size={13} /> Add E-Bill & Share (F2)
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                <div id="no-patients-registered-alert" className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-[#FAF9F6]">
                  {/* Clean, completely plain and simple surface format */}
                  <div className="max-w-md p-6 text-center select-none">
                    <p className="text-[#708271]/50 font-bold text-xs uppercase tracking-widest font-sans">Vision Eye Care Desk</p>
                    <p className="text-stone-400 font-medium text-[11px] mt-1">Select a patient dossier from the left list or register a new order to initialize clinical utilities.</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {activeTab === 'new_order' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <NewOrderPage
              customers={customers}
              products={products}
              onPlaceExistingOrder={handlePlaceExistingOrder}
              onPlaceIntegratedOrder={handlePlaceIntegratedOrder}
              onNavigateToMain={() => setActiveTab('main')}
            />
          </div>
        )}

        {activeTab === 'records' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <RecordsPage 
              customers={customers} 
              onSelectCustomerFromRecords={(cust) => {
                setActiveCustomerId(cust.id);
                setActiveTab('main');
              }} 
              onDeleteCustomer={handleDeleteCustomer}
            />
          </div>
        )}

        {activeTab === 'new_customer' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <NewCustomerPage 
              onAddCustomer={handleAddCustomer} 
              onNavigateToMain={() => setActiveTab('main')} 
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <StockInventoryPage 
              products={products} 
              onAddProduct={handleAddProduct} 
              onUpdateStock={handleUpdateProductStock} 
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <FinancialsPage 
              customers={customers} 
              products={products} 
              expenses={expenses} 
              onAddExpense={handleAddExpense} 
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white border border-[#E6E2D8] rounded-[2rem] p-8 shadow-xs">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-6">
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#2D312E] flex items-center gap-2">
                    <Settings className="text-[#708271]" size={20} />
                    Manage Clinic & Practitioner Profile
                  </h3>
                  <p className="text-xs text-[#8A847C] mt-1">Changes here will reflect instantly in PDF reports, text alerts, billing messages, and the header boards.</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                saveStoreSettings(storeSettings);
                alert('Clinic settings and practitioner details updated successfully!');
                const ev = new CustomEvent('store_settings_updated');
                window.dispatchEvent(ev);
              }} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Store Name / Title</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium"
                    />
                  </div>

                  {/* Practitioner Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Practitioner / Optometrist Name</label>
                    <input
                      type="text"
                      value={storeSettings.practitionerName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, practitionerName: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium"
                    />
                  </div>

                  {/* Practitioner Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Practitioner Suffix Title</label>
                    <input
                      type="text"
                      value={storeSettings.practitionerTitle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, practitionerTitle: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Contact Phone Number</label>
                    <input
                      type="text"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#8A847C] uppercase tracking-wider font-mono">Clinic Address</label>
                  <textarea
                    rows={2}
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:border-[#708271] text-xs text-[#2D312E] font-medium resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStoreSettings(getStoreSettings());
                      setActiveTab('main');
                    }}
                    className="px-4 py-2 bg-[#F2F0EB] hover:bg-[#E6E2D8] text-[#4A443E] text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#708271] hover:bg-[#617162] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Global Invoicing Modal */}
      {activeCustomer && (
        <NewBillingModal
          customer={activeCustomer}
          isOpen={isBillingOpen}
          onClose={() => setIsBillingOpen(false)}
          onAddOrder={handleAddOrder}
          products={products}
        />
      )}

      {/* Custom state-based confirmation modal */}
      {confirmState && confirmState.isOpen && (
        <div id="custom-confirmation-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="custom-confirmation-modal-card" className="bg-white rounded-[2rem] border border-[#E6E2D8] p-6 max-w-md w-full shadow-2xl animate-in fade-in scale-in duration-200">
            <h3 id="custom-confirm-title" className="text-base font-bold font-serif text-[#2D312E]">{confirmState.title}</h3>
            <p id="custom-confirm-message" className="text-xs text-[#8A847C] mt-2.5 leading-relaxed">{confirmState.message}</p>
            <div id="custom-confirm-actions" className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 bg-[#F2F0EB] hover:bg-[#E6E2D8] text-[#4A443E] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
