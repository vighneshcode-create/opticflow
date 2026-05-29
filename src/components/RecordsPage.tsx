import React, { useState } from 'react';
import { Customer, Prescription } from '../types';
import { Search, User, Phone, Mail, Calendar, Eye, FileText, ShoppingBag, Download, ArrowRight, TrendingDown, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface RecordsPageProps {
  customers: Customer[];
  onSelectCustomerFromRecords: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

export default function RecordsPage({
  customers,
  onSelectCustomerFromRecords,
  onDeleteCustomer,
}: RecordsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    return customers[0]?.id || '';
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;

  const handleDownloadPdf = (rx: Prescription, patientName: string, patientMobile: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(112, 130, 113); // Forest Green
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('VISION EYE CARE CLINICAL DESK', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('Prescription Progression & Ophthalmic Ledger', 145, 25);
    
    // Metadata block
    doc.setTextColor(40, 40, 40);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PATIENT RECORD', 15, 55);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Patient Name: ${patientName}`, 15, 63);
    doc.text(`Contact: ${patientMobile}`, 15, 70);
    doc.text(`Testing Date: ${rx.date}`, 145, 63);
    doc.text(`Refraction Optometrist: ${rx.doctorName}`, 145, 70);
    
    doc.setDrawColor(230, 226, 216);
    doc.line(15, 76, 195, 76);
    
    // Core Refraction Eye Power Chart Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CORE REFRACTION PARAMETERS (EYE POWER)', 15, 87);
    
    // Table Header
    doc.setFillColor(242, 240, 235);
    doc.rect(15, 93, 180, 8, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(112, 130, 113);
    doc.text('EYE / OCULUS', 18, 98);
    doc.text('SPHERICAL (SPH)', 55, 98);
    doc.text('CYLINDRICAL (CYL)', 90, 98);
    doc.text('AXIS (DEG)', 125, 98);
    doc.text('ADDITION (ADD)', 155, 98);
    doc.text('ACUITY (VA)', 180, 98);
    
    doc.setTextColor(50, 50, 50);
    doc.setFont('Helvetica', 'normal');
    
    // OD
    doc.text('OD (RIGHT EYE)', 18, 108);
    doc.text(rx.odSph, 55, 108);
    doc.text(rx.odCyl, 90, 108);
    doc.text(`${rx.odAxis}°`, 125, 108);
    doc.text(rx.odAdd, 155, 108);
    doc.text(rx.odVa, 180, 108);
    
    doc.line(15, 113, 195, 113);
    
    // OS
    doc.text('OS (LEFT EYE)', 18, 122);
    doc.text(rx.osSph, 55, 122);
    doc.text(rx.osCyl, 90, 122);
    doc.text(`${rx.osAxis}°`, 125, 122);
    doc.text(rx.osAdd, 155, 122);
    doc.text(rx.osVa, 180, 122);
    
    doc.line(15, 127, 195, 127);
    
    // Pupil Distance
    doc.setFont('Helvetica', 'bold');
    doc.text('PUPIL DISTANCE (PD):', 15, 136);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${rx.pd} mm`, 60, 136);
    
    // Notes
    if (rx.notes) {
      doc.setFillColor(249, 248, 246);
      doc.rect(15, 143, 180, 24, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.text('CLINICAL ADVISORIES & LENS RECOMMENDATIONS:', 18, 149);
      doc.setFont('Helvetica', 'oblique');
      doc.setFontSize(9.5);
      
      const splitNotes = doc.splitTextToSize(rx.notes, 172);
      doc.text(splitNotes, 18, 156);
    }
    
    // Footer terms
    doc.setFillColor(242, 240, 235);
    doc.rect(0, 275, 210, 22, 'F');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.setFont('Helvetica', 'normal');
    doc.text('Vision Eye Care specs shop network cloud. System-signed archive.', 15, 283);
    doc.text('Page 1 of 1', 185, 283);
    
    doc.save(`refraction_rx_${patientName.replace(/\s+/g, '_')}_${rx.date}.pdf`);
  };

  return (
    <div id="records-dashboard-page" className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
      
      {/* Title */}
      <div id="records-header-block" className="border-b border-[#E6E2D8] pb-4">
        <h2 id="records-title" className="text-2xl font-bold font-serif text-[#2D312E] tracking-tight">customer Database and records library</h2>
        <p id="records-subtitle" className="text-sm text-[#8A847C] mt-1">Audit complete visual historical diagnostic charts, visual acuity regressions, and client invoice records.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Directory Scroll List (4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-white rounded-[2rem] border border-[#E6E2D8] overflow-hidden self-stretch min-h-[500px]">
          
          <div className="p-5 border-b border-stone-100 bg-[#FAF9F6] shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#708271] mb-3">Library Directory</h3>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E6E2D8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#708271]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a847c]" size={13} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No patient directory records match your search criteria.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isActive = activeCustomer?.id === c.id;
                const rxsCount = c.prescriptions.length;
                const billsCount = c.orders.length;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                      isActive
                        ? 'bg-[#FAF9F6] border-[#E6E2D8] shadow-xs'
                        : 'border-transparent hover:bg-stone-50 text-[#4A443E]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-serif font-bold text-xs text-[#2D312E] truncate">{c.name}</p>
                      <p className="text-[10px] text-stone-400 mt-1 font-mono">{c.mobile}</p>
                    </div>
                    
                    <div className="text-right shrink-0 flex items-center gap-1.5 text-[9px] font-mono text-[#8a847c]">
                      <span className="px-1.5 py-0.5 bg-[#FAF9F6] border border-stone-100 rounded text-[#708271]">
                        {rxsCount} Rx
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#FAF9F6] border border-stone-100 rounded">
                        {billsCount} Tx
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Detailed records pane (8 columns) */}
        <div className="col-span-12 lg:col-span-8 self-stretch flex flex-col">
          {activeCustomer ? (
            <div className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Patient Banner */}
              <div id="patient-record-banner" className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-[#708271] text-white px-2 py-0.5 rounded">PATIENT DOSSIER</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-stone-400">ID: {activeCustomer.id}</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-[#2D312E] mt-1">{activeCustomer.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a847c] mt-1.5">
                    <span className="flex items-center gap-1"><Phone size={11} /> {activeCustomer.mobile}</span>
                    {activeCustomer.email && <span className="flex items-center gap-1"><Mail size={11} /> {activeCustomer.email}</span>}
                    <span className="flex items-center gap-1"><Calendar size={11} /> Since {activeCustomer.customerSince}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {onDeleteCustomer && (
                    <button
                      onClick={() => {
                        const idToDelete = activeCustomer.id;
                        onDeleteCustomer(idToDelete);
                        const remaining = customers.filter((c) => c.id !== idToDelete);
                        setSelectedCustomerId(remaining[0]?.id || '');
                      }}
                      className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete customer dossier permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onSelectCustomerFromRecords(activeCustomer)}
                    className="px-4 py-2 bg-[#2D312E] hover:bg-black text-white text-[11px] font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Load in Console <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Patient Core Eye Power Progression Charts Block */}
              <div className="my-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#708271]">1. Refraction Eye Powers Progression (SPH History)</h4>
                  <p className="text-[11px] text-[#8a847c] mt-0.5">Historical clinical track record of spherical parameters.</p>
                </div>

                {activeCustomer.prescriptions.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#E6E2D8] rounded-2xl bg-[#FAF9F6] text-xs text-[#8a847c]">
                    No eye test charts have been written for this patient yet. Go to Practitioner Console to run a refraction test.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Right Eye (OD) Progression */}
                    <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E6E2D8]">
                      <p className="text-[10px] font-bold text-[#708271] uppercase tracking-wide mb-2.5">Oculus Dexter (OD) SPH Evolution</p>
                      
                      {/* Timeline columns */}
                      <div className="flex gap-4 items-end justify-start h-20 pt-4 px-2 border-b border-[#E6E2D8]">
                        {activeCustomer.prescriptions.map((rx) => {
                          const val = parseFloat(rx.odSph) || 0;
                          // Standard maximum eye SPH is +/- 6.00
                          const visualPercentage = Math.min(100, (Math.abs(val) / 6) * 100);
                          return (
                            <div key={rx.id} className="flex-1 flex flex-col items-center group relative">
                              <div 
                                className={`w-4 ${val < 0 ? 'bg-red-300' : 'bg-emerald-300'} rounded-t-sm`} 
                                style={{ height: `${Math.max(4, visualPercentage)}px` }}
                              ></div>
                              <span className="text-[8px] font-mono font-bold mt-1.5 text-stone-700">{rx.odSph}</span>
                              <span className="text-[7px] text-[#8A847C] font-mono leading-none tracking-tighter mt-0.5">{rx.date.split('-')[1]}/{rx.date.split('-')[0].substring(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Left Eye (OS) Progression */}
                    <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E6E2D8]">
                      <p className="text-[10px] font-bold text-[#708271] uppercase tracking-wide mb-2.5">Oculus Sinister (OS) SPH Evolution</p>
                      
                      <div className="flex gap-4 items-end justify-start h-20 pt-4 px-2 border-b border-[#E6E2D8]">
                        {activeCustomer.prescriptions.map((rx) => {
                          const val = parseFloat(rx.osSph) || 0;
                          const visualPercentage = Math.min(100, (Math.abs(val) / 6) * 100);
                          return (
                            <div key={rx.id} className="flex-1 flex flex-col items-center group relative">
                              <div 
                                className={`w-4 ${val < 0 ? 'bg-red-300' : 'bg-emerald-300'} rounded-t-sm`} 
                                style={{ height: `${Math.max(4, visualPercentage)}px` }}
                              ></div>
                              <span className="text-[8px] font-mono font-bold mt-1.5 text-stone-700">{rx.osSph}</span>
                              <span className="text-[7px] text-[#8A847C] font-mono leading-none tracking-tighter mt-0.5">{rx.date.split('-')[1]}/{rx.date.split('-')[0].substring(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Historical Prescriptions List */}
              <div className="space-y-3.5 flex-1 overflow-y-auto px-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#708271]">2. Compiled Diagnostics & Prescription Charts ({activeCustomer.prescriptions.length})</h4>
                </div>

                {activeCustomer.prescriptions.length === 0 ? (
                  <p className="text-xs italic text-stone-400">None registered.</p>
                ) : (
                  <div className="space-y-3">
                    {activeCustomer.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-stone-200">
                          <div>
                            <span className="font-serif font-bold text-[#2D312E]">{rx.doctorName}</span>
                            <span className="text-[9px] text-[#8a847c] ml-2 font-mono">{rx.date}</span>
                          </div>
                          
                          <button
                            onClick={() => handleDownloadPdf(rx, activeCustomer.name, activeCustomer.mobile)}
                            className="text-[#708271] hover:text-[#5C6E5B] flex items-center gap-1 font-bold font-mono text-[9px] uppercase border border-[#E6E2D8] px-2 py-0.5 rounded bg-white hover:bg-[#FAF9F6] transition"
                          >
                            <Download size={10} /> Extract PDF
                          </button>
                        </div>

                        {/* Power figures summary */}
                        <div className="grid grid-cols-2 gap-4 text-[11px]">
                          <div className="p-2.5 bg-white border border-[#E6E2D8] rounded-xl">
                            <p className="font-bold text-[#708271] text-[9px] mb-1">RIGHT EYE (OD)</p>
                            <div className="grid grid-cols-5 gap-1 font-mono text-stone-700 text-[10px]">
                              <div><p className="text-[8px] text-stone-400">SPH</p><b>{rx.odSph}</b></div>
                              <div><p className="text-[8px] text-stone-400">CYL</p><b>{rx.odCyl}</b></div>
                              <div><p className="text-[8px] text-stone-400">AXIS</p><b>{rx.odAxis}°</b></div>
                              <div><p className="text-[8px] text-stone-400">ADD</p><b>{rx.odAdd}</b></div>
                              <div><p className="text-[8px] text-stone-400">VA</p><b>{rx.odVa}</b></div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-white border border-[#E6E2D8] rounded-xl">
                            <p className="font-bold text-[#708271] text-[9px] mb-1">LEFT EYE (OS)</p>
                            <div className="grid grid-cols-5 gap-1 font-mono text-stone-700 text-[10px]">
                              <div><p className="text-[8px] text-stone-400">SPH</p><b>{rx.osSph}</b></div>
                              <div><p className="text-[8px] text-stone-400">CYL</p><b>{rx.osCyl}</b></div>
                              <div><p className="text-[8px] text-stone-400">AXIS</p><b>{rx.osAxis}°</b></div>
                              <div><p className="text-[8px] text-stone-400">ADD</p><b>{rx.osAdd}</b></div>
                              <div><p className="text-[8px] text-stone-400">VA</p><b>{rx.osVa}</b></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-[#8a847c]">
                          <span>PUPIL DISTANCE (PD): <b>{rx.pd} mm</b></span>
                        </div>

                        {rx.notes && (
                          <p className="text-[11px] text-[#4A443E] bg-[#FAF9F6] p-2.5 border border-stone-100 rounded-xl leading-relaxed italic font-serif">
                            "{rx.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2rem] border border-[#E6E2D8] flex-1 flex flex-col justify-center items-center text-center">
              <Eye className="text-stone-300 mb-2 animate-pulse" size={48} />
              <p className="text-sm font-bold text-[#2D312E] font-serif">No Customer Selected</p>
              <p className="text-xs text-[#8A847C] mt-1 max-w-xs">Select a customer from the left directory column to load their extensive diagnostic charts.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
