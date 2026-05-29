import React, { useState } from 'react';
import { Customer, Product, MonthlyExpense } from '../types';
import { IndianRupee, TrendingUp, TrendingDown, HelpCircle, AlertTriangle, Plus, Landmark, DollarSign, Calendar, Wallet, Percent } from 'lucide-react';

interface FinancialsPageProps {
  customers: Customer[];
  products: Product[];
  expenses: MonthlyExpense[];
  onAddExpense: (expense: MonthlyExpense) => void;
}

export default function FinancialsPage({
  customers,
  products,
  expenses,
  onAddExpense,
}: FinancialsPageProps) {
  // Expense form state
  const [expenseMonth, setExpenseMonth] = useState('May 2026');
  const [expenseRent, setExpenseRent] = useState<number>(25000);
  const [expenseLightBill, setExpenseLightBill] = useState<number>(4500);
  const [expenseSalaries, setExpenseSalaries] = useState<number>(40000);
  const [expenseMisc, setExpenseMisc] = useState<number>(3500);
  const [expenseNotes, setExpenseNotes] = useState('');
  
  const [successMsg, setSuccessMsg] = useState(false);

  // 1. Calculate Lifetime Sales / Revenue (All orders across all patients)
  const allOrders = customers.flatMap(c => c.orders);
  const totalLifetimeSales = allOrders.reduce((sum, o) => sum + o.total, 0);

  // 2. Calculate Cost of Goods Sold (COGS)
  // To find the exact cost of goods sold, we map each item sold to its cost price as tracked in the catalog!
  const totalCogs = allOrders.reduce((sum, o) => {
    const orderCogs = o.items.reduce((itemSum, it) => {
      // Find matching product in catalog to get cost price
      const product = products.find(p => p.id === it.id || p.name === it.name);
      const unitCost = product ? product.costPrice : (it.price * 0.5); // Fallback to 50% cost if custom
      return itemSum + (unitCost * it.quantity);
    }, 0);
    return sum + orderCogs;
  }, 0);

  // 3. Total Expense of Stock: The sum of all products' costPrice multiplied by their initialStockBought (initial capital deployed)
  // plus any additional stock replenishment
  const totalExpenseOfStock = products.reduce((sum, p) => sum + (p.initialStockBought * p.costPrice), 0);

  // 4. Calculate Lifetime Operational Expenses (Rent, Light Bill, Salaries, Misc)
  const totalRentSales = expenses.reduce((sum, e) => sum + e.rent, 0);
  const totalLightBill = expenses.reduce((sum, e) => sum + e.lightBill, 0);
  const totalSalaries = expenses.reduce((sum, e) => sum + e.salaries, 0);
  const totalMisc = expenses.reduce((sum, e) => sum + e.misc, 0);
  const totalOperationalExpenses = totalRentSales + totalLightBill + totalSalaries + totalMisc;

  // 5. Total Accumulated Expenditures (Product purchase cost plus operational bills)
  const totalAccumulatedExpense = totalExpenseOfStock + totalOperationalExpenses;

  // 6. Net Profit Gain (Gross Sales minus COGS and Operating bills)
  const totalNetProfit = totalLifetimeSales - (totalCogs + totalOperationalExpenses);
  const profitMarginPercent = totalLifetimeSales > 0 ? Math.round((totalNetProfit / totalLifetimeSales) * 100) : 0;

  // Handle addition of operational bills
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseMonth.trim() || expenseRent < 0 || expenseLightBill < 0 || expenseSalaries < 0 || expenseMisc < 0) return;

    // Check if month already exists. If yes, replace or append. For simplicity, we create a new entry.
    const newExp: MonthlyExpense = {
      id: `exp-${Date.now()}`,
      month: expenseMonth.trim(),
      rent: expenseRent,
      lightBill: expenseLightBill,
      salaries: expenseSalaries,
      misc: expenseMisc,
      notes: expenseNotes.trim() || undefined
    };

    onAddExpense(newExp);
    setExpenseNotes('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // Prepare monthly comparative data for rendering bar charts comparing sales and expenses
  // Let's analyze sales per month (e.g. from orders).
  // Standard months we have preloaded: "May 2026", "April 2026", "March 2026", "June 2016" (historics)
  // Let's compile dynamic sales & expenses for the top operating months:
  const monthlyBreakdown = expenses.map(exp => {
    const monthStr = exp.month; // e.g. "May 2026" or "April 2026"
    
    // Total sales in this month (filtering orders matching this month/year)
    // In our seed data, dates are YYYY-MM-DD. Let's parse month strings.
    const monthMapping: Record<string, string> = {
      'May 2026': '2026-05',
      'April 2026': '2026-04',
      'March 2026': '2026-03',
    };
    const prefix = monthMapping[monthStr] || '2026-05';
    
    // Filter orders
    const monthOrders = allOrders.filter(o => o.date.startsWith(prefix));
    const grossSales = monthOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Cost of Goods Sold in this month
    const monthlyCogs = monthOrders.reduce((sum, o) => {
      const orderCogs = o.items.reduce((itemSum, it) => {
        const product = products.find(p => p.id === it.id || p.name === it.name);
        const unitCost = product ? product.costPrice : (it.price * 0.5);
        return itemSum + (unitCost * it.quantity);
      }, 0);
      return sum + orderCogs;
    }, 0);

    // Operational expenses this month
    const fixedExpenses = exp.rent + exp.lightBill + exp.salaries + exp.misc;
    
    // Total Outflow this month (Cost of goods sold + bills)
    const totalMonthExpense = monthlyCogs + fixedExpenses;
    const netMonthProfit = grossSales - totalMonthExpense;

    return {
      month: monthStr,
      sales: grossSales,
      expense: totalMonthExpense,
      profit: netMonthProfit,
      cogs: monthlyCogs,
      fixed: fixedExpenses
    };
  });

  // Calculate highest valuation to scale SVG chart heights
  const maxValInChart = Math.max(
    ...monthlyBreakdown.flatMap(d => [d.sales, d.expense, Math.abs(d.profit)]),
    50000 // default minimum peak
  );

  return (
    <div id="financial-ledger-analyzer" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
      
      {/* Title */}
      <div id="finance-header-block" className="border-b border-[#E6E2D8] pb-4">
        <h2 id="finance-title" className="text-2xl font-bold font-serif text-[#2D312E] tracking-tight">Business Financials & profit center</h2>
        <p id="finance-subtitle" className="text-sm text-[#8A847C] mt-1">Audit overall stock investments, monthly utilities bills, check-out client sales, and net shop profits.</p>
      </div>

      {/* Main Stats ribbon (lifetime) */}
      <div id="financials-overall-ribbon" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            < IndianRupee size={12} className="text-[#708271]" /> Lifetime gross Sales
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#2D312E]">₹{totalLifetimeSales.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Invoiced optical client receipts.</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total stock buying cost</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#8A847C]">₹{totalExpenseOfStock.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-[#8a847c] mt-1 font-medium">All historical warehouse capital investments.</p>
        </div>

        <div className="bg-white p-5 rounded-[1.5rem] border border-[#E6E2D8] flex flex-col justify-between">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Shop Operating Bills</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-stone-500">₹{totalOperationalExpenses.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-[#8A847C]/80 mt-1">Rent, Light bills, Salaries logged.</p>
        </div>

        <div className={`p-5 rounded-[1.5rem] border ${totalNetProfit >= 0 ? 'bg-[#708271] text-white border-transparent' : 'bg-red-50 border-red-200 text-red-900'} flex flex-col justify-between`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${totalNetProfit >= 0 ? 'text-white/85' : 'text-red-700'}`}>Cumulative Net profit</p>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono">₹{totalNetProfit.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] opacity-90 mt-1 font-sans">
            {totalNetProfit >= 0 ? `Accomplished ${profitMarginPercent}% profit margin on invoice base.` : 'Loss registered due to initial shop capital startup spends.'}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* Left: Dynamic Visual Performance Chart comparing Sales and Expenses (7 columns) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#708271] font-bold">Automatic Data Analytics</span>
              <h3 className="text-lg font-bold font-serif text-[#2D312E] mt-0.5">Rent, Light Bill, Stock Expenses vs Sales</h3>
              <p className="text-xs text-[#8A847C] mt-1">Side-by-side month-wise analytics comparing total sales revenue against overall outlays (Buying costs + Operating Bills).</p>
            </div>

            {/* SVG Visual Graph */}
            <div className="my-6 min-h-[220px] flex items-end justify-between relative w-full pt-4 border-b border-[#E6E2D8] px-4">
              
              {/* Background Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4">
                <div className="border-t border-dashed border-stone-500 w-full h-0"></div>
                <div className="border-t border-dashed border-stone-500 w-full h-0"></div>
                <div className="border-t border-dashed border-stone-500 w-full h-0"></div>
              </div>

              {monthlyBreakdown.map((data, idx) => {
                const salesHeight = (data.sales / maxValInChart) * 160;
                const expenseHeight = (data.expense / maxValInChart) * 160;
                const profitHeight = (Math.max(0, data.profit) / maxValInChart) * 160;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative z-10 mx-2">
                    
                    {/* Floating Tooltip Hover */}
                    <div className="absolute bottom-40 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white rounded-xl p-3 text-[10px] w-48 shadow-lg z-20 leading-relaxed font-sans pointer-events-none text-left">
                      <p className="font-bold border-b border-white/20 pb-1 mb-1 text-center font-serif text-[11px]">{data.month}</p>
                      <div className="flex justify-between"><span>Revenue Sales:</span> <span className="font-mono font-bold text-emerald-400">₹{data.sales.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span>Supplier COGS:</span> <span className="font-mono text-stone-300">₹{data.cogs.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span>Fixed Bills:</span> <span className="font-mono text-stone-300">₹{data.fixed.toLocaleString('en-IN')}</span></div>
                      <p className="border-t border-white/10 mt-1 pt-1 flex justify-between font-bold"><span>Net Profit:</span> <span className="font-mono text-yellow-300">₹{data.profit.toLocaleString('en-IN')}</span></p>
                    </div>

                    {/* Columns layout */}
                    <div className="flex items-end gap-1.5 h-[160px] w-full justify-center">
                      
                      {/* Bar 1: Sales */}
                      <div 
                        className="w-5 bg-[#708271] hover:bg-[#5C6E5B] rounded-t-md transition-all shadow-sm"
                        style={{ height: `${Math.max(2, salesHeight)}px` }}
                        title="Gross Sales"
                      ></div>
                      
                      {/* Bar 2: Overall Expenses */}
                      <div 
                        className="w-5 bg-[#8A847C] hover:bg-[#746E66] rounded-t-md transition-all shadow-sm"
                        style={{ height: `${Math.max(2, expenseHeight)}px` }}
                        title="Overall Outflow Spends"
                      ></div>
                      
                      {/* Bar 3: Profit */}
                      <div 
                        className="w-5 bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all shadow-sm"
                        style={{ height: `${Math.max(2, profitHeight)}px` }}
                        title="Net Operating Profit"
                      ></div>

                    </div>

                    {/* X-axis Label */}
                    <div className="text-[10px] font-bold text-stone-700 font-serif whitespace-nowrap">
                      {data.month}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-4 items-center justify-center text-[10px] text-[#8a847c] font-bold uppercase tracking-wider mb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#708271] rounded-sm"></div>
                <span>Monthly Sales Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#8A847C] rounded-sm"></div>
                <span>Cumulative Monthly Outlay (COGS + Bills)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
                <span>Net Profit Generated</span>
              </div>
            </div>

            <p className="text-[11px] italic text-[#8A847C] text-center border-t border-stone-100 pt-3">
              💡 Pro Tip: Hover on any monthly bar column above to reveal cost segmentation (COGS, fixed operational bills, and exact margins).
            </p>

          </div>
        </div>

        {/* Right: Operational Bills Ledger Inputs and Entry (5 columns) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] space-y-4">
            
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#708271] font-bold">Ledger Logger Form</span>
              <h3 className="text-sm font-bold font-serif text-[#2D312E]">Log Operating Bills for a Month</h3>
              <p className="text-[11px] text-[#8a847c]">Declare fixed expenditures such as shop rental leases, power grid lightbills, employee payrolls, and miscs.</p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <p className="font-bold">✓ Expenses logged successfully for {expenseMonth}!</p>
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-500 font-bold mb-1">Target Billing Period / Month</label>
                <select
                  value={expenseMonth}
                  onChange={(e) => setExpenseMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#708271]"
                >
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026 (Projections)</option>
                  <option value="April 2026">April 2026 (Audited)</option>
                  <option value="March 2026">March 2026 (Audited)</option>
                  <option value="February 2026">February 2026 (Audited)</option>
                  <option value="January 2026">January 2026 (Audited)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Shop rent lease (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expenseRent}
                    onChange={(e) => setExpenseRent(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] font-mono rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Light bill utility (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expenseLightBill}
                    onChange={(e) => setExpenseLightBill(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Staff payroll salaries (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expenseSalaries}
                    onChange={(e) => setExpenseSalaries(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] font-mono rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 font-bold mb-1">Miscellaneous miscs (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={expenseMisc}
                    onChange={(e) => setExpenseMisc(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] font-mono rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 font-bold mb-1">Memo / Audit comment</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via bank transfer"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl focus:ring-1 focus:ring-[#708271]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2D312E] hover:bg-black text-white rounded-xl font-bold uppercase transition"
              >
                Log to Operational Ledger
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Historical Ledger Table of Monthly Utilities and Expenses */}
      <div id="historical-fixed-ledger" className="bg-white rounded-[2rem] border border-[#E6E2D8] p-6 space-y-4">
        <div>
          <h3 className="text-md font-bold font-serif text-[#2D312E]">operating bills log archive</h3>
          <p className="text-xs text-[#8A847C]">A tabulated ledger detailing monthly overhead liabilities paid to date.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E6E2D8] text-[9px] uppercase tracking-widest text-[#708271] font-bold">
                <th className="p-3">Period</th>
                <th className="p-3 text-right">Shop Rent</th>
                <th className="p-3 text-right">Light Bill</th>
                <th className="p-3 text-right">Payroll Salaries</th>
                <th className="p-3 text-right">Misc Spends</th>
                <th className="p-3 text-right">Total Operational Cost</th>
                <th className="p-3">Audit Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {expenses.map((e) => {
                const totalMonthOp = e.rent + e.lightBill + e.salaries + e.misc;
                return (
                  <tr key={e.id} className="hover:bg-stone-50 font-sans text-stone-700">
                    <td className="p-3 font-semibold font-serif text-[#2D312E]">{e.month}</td>
                    <td className="p-3 text-right font-mono text-stone-600">₹{e.rent.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono text-stone-600">₹{e.lightBill.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono text-stone-600">₹{e.salaries.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono text-stone-600">₹{e.misc.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#708271]">₹{totalMonthOp.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-stone-400 italic font-normal">{e.notes || 'No remarks'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
