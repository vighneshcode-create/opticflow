import { Customer, Order } from '../types';
import { generateAndDownloadPdfBill } from '../utils/pdfGenerator';
import { getWhatsAppUrl, getSMSUrl } from '../utils/shareUtils';
import { FileDown, Send, MessageSquare, PhoneCall, Archive, Clock, Trash2 } from 'lucide-react';

interface OrderHistoryProps {
  customer: Customer;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export default function OrderHistory({
  customer,
  onUpdateOrderStatus,
  onDeleteOrder,
}: OrderHistoryProps) {
  const orders = customer.orders;

  const handleActionPdfAndWhatsapp = (order: Order) => {
    // 1. Generate and trigger download of PDF
    const rx = customer.prescriptions.find((r) => r.id === order.prescriptionId) || customer.prescriptions[0];
    generateAndDownloadPdfBill(customer, order, rx);
    
    // 2. Open WhatsApp Web/App prefilled message details
    const waUrl = getWhatsAppUrl(customer, order);
    window.open(waUrl, '_blank', 'noreferrer,noopener');
  };

  const handleActionPdfAndSms = (order: Order) => {
    // 1. Generate and trigger download of PDF
    const rx = customer.prescriptions.find((r) => r.id === order.prescriptionId) || customer.prescriptions[0];
    generateAndDownloadPdfBill(customer, order, rx);

    // 2. Open SMS link to dispatch reminder
    const smsUrl = getSMSUrl(customer, order);
    window.open(smsUrl, '_blank', 'noreferrer,noopener');
  };

  const handleDownloadPdfOnly = (order: Order) => {
    const rx = customer.prescriptions.find((r) => r.id === order.prescriptionId) || customer.prescriptions[0];
    generateAndDownloadPdfBill(customer, order, rx);
  };

  return (
    <div id="order-history-container" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] flex flex-col h-full overflow-hidden">
      
      {/* Header text */}
      <div id="order-history-header" className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 id="orders-title" className="text-xs font-bold uppercase tracking-widest text-[#708271]">Transaction History</h2>
          <p id="orders-subtitle" className="text-sm text-[#8A847C]">Billing, PDF generation, and sharing</p>
        </div>
        <div id="badge-historical-guard" className="flex gap-2 items-center">
          <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E2D8] text-[9px] font-mono text-[#8A847C] rounded-full">
            10-Year Archive Ledger
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div id="no-orders-box" className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-[#FAF9F6] border border-dashed border-[#E6E2D8] rounded-2xl">
          <Clock className="text-[#8A847C] mb-2 opacity-50" size={32} />
          <p className="text-xs font-bold text-[#4A443E]">This customer has no previous purchase entries.</p>
          <p className="text-[10px] text-[#8A847C] mt-1">Open billing to register their specs purchase.</p>
        </div>
      ) : (
        <div id="orders-scroll-table-wrapper" className="flex-1 overflow-y-auto pr-1">
          <div id="orders-table-grid" className="space-y-4">
            {orders.map((order) => {
              const rxUsed = customer.prescriptions.find((r) => r.id === order.prescriptionId);
              
              return (
                <div
                  id={`order-bill-card-${order.id}`}
                  key={order.id}
                  className="p-4 bg-[#FAF9F6] border border-[#E6E2D8] rounded-2xl flex flex-col hover:border-stone-300 transition-colors"
                >
                  {/* Top line of bill card */}
                  <div id="bill-card-headline" className="flex justify-between items-center pb-2 border-b border-stone-200/60 text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#708271] text-sm mr-2">#{order.id}</span>
                      <span className="text-stone-400 font-mono text-[11px]">{order.date}</span>
                    </div>
                    <div id="status-ribbon-badge" className="flex items-center gap-1.5">
                      {order.status === 'Archived' ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px] uppercase font-bold flex items-center gap-0.5">
                          <Archive size={8} /> Archived
                        </span>
                      ) : order.status === 'Delivered' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded text-[9px] uppercase font-bold">
                          Delivered
                        </span>
                      ) : order.status === 'Paid' ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/50 rounded text-[9px] uppercase font-bold">
                          Paid / In Fitting
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50 rounded text-[9px] uppercase font-bold">
                          Pending / Credit
                        </span>
                      )}

                      {/* Dropdown status update for demo toggling */}
                      {order.status !== 'Archived' && (
                        <select
                          id={`change-status-select-${order.id}`}
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                          className="bg-white border border-[#E6E2D8] rounded px-1 text-[9px] text-stone-500 font-bold focus:outline-none"
                        >
                          <option value="Delivered">Set Delivered</option>
                          <option value="Paid">Set Paid</option>
                          <option value="Pending">Set Pending</option>
                        </select>
                      )}

                      {onDeleteOrder && (
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer"
                          title="Delete this order permanently"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Purchased items list summary inside bill card */}
                  <div id="bill-purchased-items" className="py-3 text-xs space-y-1 flex-1">
                    {order.items.map((it) => (
                      <div id={`bill-item-${it.id}`} key={it.id} className="flex justify-between text-stone-700">
                        <span className="font-serif">
                          {it.name} <span className="text-stone-400 text-[10px]">x {it.quantity}</span>
                        </span>
                        <span className="font-mono font-medium">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}

                    {/* Prescription association label */}
                    {rxUsed && (
                      <p className="text-[10px] bg-white border border-[#E6E2D8] text-[#708271] p-1.5 rounded-lg mt-2 inline-block font-mono italic">
                        Connected to refraction: OD {rxUsed.odSph} SPH / OS {rxUsed.osSph} SPH tested {rxUsed.date}
                      </p>
                    )}
                  </div>

                  {/* Calculations sum-footer */}
                  <div id="bill-card-total-box" className="pt-2 border-t border-dashed border-stone-200 flex justify-between items-center text-xs">
                    <span className="text-stone-400 font-sans text-[10px] uppercase">GST, Discount inclusive final sum</span>
                    <span className="font-semibold text-stone-800">
                      Grand Total: <span className="font-mono text-[#708271] font-bold text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                    </span>
                  </div>

                  {/* Interactive direct-sharing operations */}
                  <div id="sharing-actions-grid" className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2">
                    <button
                      id={`action-pdf-only-${order.id}`}
                      onClick={() => handleDownloadPdfOnly(order)}
                      className="py-1.5 bg-white border border-[#E6E2D8] hover:border-[#708271] rounded-xl text-[10px] text-stone-600 font-bold flex items-center justify-center gap-1 transition-all"
                      title="Download Offline PDF Receipt"
                    >
                      <FileDown size={11} className="text-[#8A847C]" /> Get PDF
                    </button>
                    <button
                      id={`action-whatsapp-${order.id}`}
                      onClick={() => handleActionPdfAndWhatsapp(order)}
                      className="py-1.5 bg-[#25D366]/10 border border-[#25D366]/40 text-[#128C7E] px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all hover:bg-[#25D366]/20"
                      title="Download PDF print and dispatch message via WhatsApp Web or Mobile connection directly"
                    >
                      <MessageSquare size={11} /> WhatsApp Bill
                    </button>
                    <button
                      id={`action-sms-${order.id}`}
                      onClick={() => handleActionPdfAndSms(order)}
                      className="py-1.5 bg-[#FAF9F6] border border-[#E6E2D8]/80 hover:bg-[#E8E6E1] rounded-xl text-[10px] text-[#4A443E] font-bold flex items-center justify-center gap-1 transition-all"
                      title="Download PDF invoice and parse prefilled cellular SMS"
                    >
                      <PhoneCall size={11} className="text-[#8A847C]" /> SMS Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
