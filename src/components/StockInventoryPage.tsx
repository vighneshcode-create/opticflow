import React, { useState } from 'react';
import { Product } from '../types';
import { Package, Plus, Search, Tag, AlertTriangle, ShieldAlert, BadgePercent, TrendingUp, Check, Trash2 } from 'lucide-react';

interface StockInventoryPageProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateStock: (productId: string, quantityToAdd: number) => void;
  onDeleteProduct?: (productId: string) => void;
}

export default function StockInventoryPage({
  products,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
}: StockInventoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories'>('All');
  
  // New Product Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories'>('Specs');
  const [newProductCostPrice, setNewProductCostPrice] = useState<number>(0);
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [newProductStock, setNewProductStock] = useState<number>(0);
  
  // Inline replenishment state
  const [replenishId, setReplenishId] = useState<string | null>(null);
  const [replenishQty, setReplenishQty] = useState<number>(10);

  const [formSuccess, setFormSuccess] = useState(false);

  // Financial Stock Stats
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  
  // Total Expense of stock: calculated by taking each product's costPrice * initialStockBought
  // representing the total capital ever deployed to purchase inventory.
  // Alternatively we can also calculate current stock worth at Cost Price:
  const currentStockWorthCost = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalExpenseOfStockBought = products.reduce((sum, p) => sum + (p.initialStockBought * p.costPrice), 0);
  
  const currentStockWorthRetail = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const potentialProfitOnHold = currentStockWorthRetail - currentStockWorthCost;

  // Search and filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || newProductCostPrice <= 0 || newProductPrice <= 0 || newProductStock < 0) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price: newProductPrice,
      costPrice: newProductCostPrice,
      stock: newProductStock,
      initialStockBought: newProductStock,
    };

    onAddProduct(newProduct);
    
    // Reset Form
    setNewProductName('');
    setNewProductCostPrice(0);
    setNewProductPrice(0);
    setNewProductStock(0);
    
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  const handleInlineReplenishSubmit = (productId: string) => {
    if (replenishQty <= 0) return;
    onUpdateStock(productId, replenishQty);
    setReplenishId(null);
  };

  return (
    <div id="stock-inventory-page" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
      
      {/* Title Header */}
      <div id="stock-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E2D8] pb-4">
        <div>
          <h2 id="stock-title" className="text-2xl font-bold font-serif text-[#2D312E] tracking-tight">optical Inventory and stock ledger</h2>
          <p id="stock-subtitle" className="text-sm text-[#8A847C] mt-1">Configure Frame collections, RX diagnostic lenses, disposable contact packs, and accessories.</p>
        </div>
        
        <button
          id="btn-trigger-add-stock-p"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-[#708271] text-white hover:bg-[#5C6E5B] text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#708271]/10"
        >
          <Plus size={14} /> New Entry of Stock Product
        </button>
      </div>

      {/* Stock Financial Cards */}
      <div id="stock-valuation-cards" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-[#8A847C] uppercase tracking-wider">Total Deployed Capital</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#2D312E]">₹{totalExpenseOfStockBought.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-[#8a847c] mt-1 italic">Historical purchase cost value of all stocks ever added.</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-[#8A847C] uppercase tracking-wider">Active Inventory Cost Val</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#708271]">₹{currentStockWorthCost.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Cost valuation of current items on shelves.</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-[#8A847C] uppercase tracking-wider">Potential Sell Valuation</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#2D312E]">₹{currentStockWorthRetail.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">If all products on hand are sold.</p>
        </div>

        <div className="bg-[#FAF9F6] p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-[#708271] uppercase tracking-wider">Profit Margin on Hand</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#708271]">₹{potentialProfitOnHold.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-[#8A847C]/80 mt-1 font-medium">Average margin: {currentStockWorthRetail > 0 ? Math.round((potentialProfitOnHold / currentStockWorthRetail) * 100) : 0}%</p>
        </div>

      </div>

      {/* Adding form drawer modal */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#708271]/20 shadow-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-6 font-serif">
            <h3 className="text-lg font-bold text-[#2D312E] flex items-center gap-2">
              <Package className="text-[#708271]" size={18} /> New Entry of Stock of Product
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#8A847C] hover:text-[#2D312E] text-xs font-semibold uppercase tracking-wider font-sans bg-stone-100 px-3 py-1 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>

          {formSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
              <Check className="text-emerald-600 shrink-0" size={24} />
              <div>
                <p className="font-bold text-sm">Product stock entry successfully compiled!</p>
                <p className="text-xs text-emerald-700/80 mt-1">Item is now available inside our billing catalog and stock ledgers.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                <div className="md:col-span-5">
                  <label className="block text-stone-500 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Product Name / Brand specification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RayBan Clubmaster Classic Brown"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-stone-500 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Product Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  >
                    <option value="Specs">Specs (Frames & Lenses)</option>
                    <option value="Goggles">Goggles (Sunglasses)</option>
                    <option value="Contact Lenses">Contact Lenses</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-stone-500 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Initial Stock count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 20"
                    value={newProductStock || ''}
                    onChange={(e) => setNewProductStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                </div>

                <div className="md:col-span-2">
                  <span className="block text-center text-[10px] text-stone-400 font-medium py-1.5 bg-[#FBFBFB] rounded-lg border border-dashed border-[#E6E2D8] mt-6">
                    Product Entry
                  </span>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                
                <div className="p-4 bg-[#FAF9F6] border border-[#E6E2D8] rounded-2xl">
                  <label className="block text-[#708271] font-bold mb-1.5 uppercase text-[9px] tracking-wider">Cost Price (Supplier's Original Purchase Price ₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Supplier worth e.g. 1500"
                    value={newProductCostPrice || ''}
                    onChange={(e) => setNewProductCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6E2D8] rounded-xl font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">This registers a business purchase expense in financials ledger.</p>
                </div>

                <div className="p-4 bg-[#FAF9F6] border border-[#E6E2D8] rounded-2xl">
                  <label className="block text-[#2D312E] font-bold mb-1.5 uppercase text-[9px] tracking-wider font-serif">Selling Shelf Price (Patient Billing Rate ₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Patient retail worth e.g. 3500"
                    value={newProductPrice || ''}
                    onChange={(e) => setNewProductPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E6E2D8] rounded-xl font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#708271]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Gross profit margin: {newProductPrice > newProductCostPrice && newProductPrice > 0 ? Math.round(((newProductPrice - newProductCostPrice)/newProductPrice)*100) : 0}%</p>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2D312E] hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md"
                >
                  Write Product entry to Stock Roster
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* Directory Controls and Search Filters */}
      <div id="stock-search-bar" className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-white rounded-2xl border border-[#E6E2D8]">
        
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search stock catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#708271]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a847c]" size={14} />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {(['All', 'Specs', 'Goggles', 'Contact Lenses', 'Accessories'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#708271] text-white'
                  : 'bg-[#FAF9F6] text-[#8A847C] hover:text-[#4A443E] border border-stone-100 hover:border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Stock Catalog Table */}
      <div className="bg-white rounded-[2rem] border border-[#E6E2D8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E6E2D8] uppercase tracking-widest text-[#708271] text-[9px] font-bold">
                <th className="p-4">SKU Code</th>
                <th className="p-4">Item Name / Brand Description</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-right">Cost Price (Supplier)</th>
                <th className="p-4 text-right">Retail Price (Shelf)</th>
                <th className="p-4 text-center">In-Stock Count</th>
                <th className="p-4 text-center">Inventory Health</th>
                <th className="p-4 text-center">Supplies Replenish</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-[#4A443E]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400 bg-[#FAF9F6]">
                    No stock products match the search query or category filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const outOfStock = p.stock === 0;
                  const lowStock = p.stock > 0 && p.stock <= 5;
                  const healthyStock = p.stock > 5;
                  const markupPercent = Math.round(((p.price - p.costPrice) / p.price) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#8A847C]">{p.id}</td>
                      <td className="p-4 font-serif font-bold text-[#2D312E]">{p.name}</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-[9px] font-bold font-mono">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold">₹{p.costPrice.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right font-mono font-bold text-[#708271]">
                        <div>₹{p.price.toLocaleString('en-IN')}</div>
                        <div className="text-[8px] text-stone-400 font-sans tracking-wide">Markup: +{markupPercent}%</div>
                      </td>
                      <td className="p-4 text-center font-mono font-extrabold text-stone-800 text-sm">
                        {p.stock} units
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {outOfStock && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-bold flex items-center justify-center gap-1 max-w-[120px] mx-auto">
                            <ShieldAlert size={10} /> OUT OF STOCK
                          </span>
                        )}
                        {lowStock && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[9px] font-bold flex items-center justify-center gap-1 max-w-[120px] mx-auto">
                            <AlertTriangle size={10} /> LOW STOCK ({p.stock})
                          </span>
                        )}
                        {healthyStock && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[9px] font-bold flex items-center justify-center gap-1 max-w-[120px] mx-auto">
                            <Check size={10} /> HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {replenishId === p.id ? (
                          <div className="flex justify-center items-center gap-1.5 animate-in zoom-in-95 duration-100">
                            <input
                              type="number"
                              min="1"
                              className="w-14 text-center py-1 bg-[#FAF9F6] border border-[#E6E2D8] rounded font-mono text-xs"
                              value={replenishQty}
                              onChange={(e) => setReplenishQty(parseInt(e.target.value) || 0)}
                            />
                            <button
                              onClick={() => handleInlineReplenishSubmit(p.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setReplenishId(null)}
                              className="text-stone-400 hover:text-stone-600 text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplenishId(p.id);
                              setReplenishQty(10);
                            }}
                            className="px-3 py-1.5 bg-stone-100 text-[#4A443E] rounded-lg hover:bg-[#708271] hover:text-white transition-all font-semibold font-sans text-[10px]"
                          >
                            + Refill stock
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {onDeleteProduct && (
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer"
                            title="Delete product permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
