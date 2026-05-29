import React, { useState } from 'react';
import { Customer } from '../types';
import { Search, UserPlus, Phone, Calendar, Mail, Trash2 } from 'lucide-react';

interface CustomerSelectorProps {
  customers: Customer[];
  activeCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: (name: string, mobile: string, email: string) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

export default function CustomerSelector({
  customers,
  activeCustomer,
  onSelectCustomer,
  onAddCustomer,
  onDeleteCustomer,
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Filter customers of any era (up to 10 years old)
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim()) return;
    onAddCustomer(newName.trim(), newMobile.trim(), newEmail.trim());
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div id="customer-selector-container" className="flex flex-col h-full bg-[#F2F0EB] border-r border-[#E6E2D8] w-80">
      {/* Header section */}
      <div id="sidebar-logo-header" className="p-6 border-b border-[#E6E2D8] flex items-center gap-3">
        <div id="logo-icon-globe" className="w-10 h-10 bg-[#708271] rounded-full flex items-center justify-center text-white shadow-sm shadow-[#708271]/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" id="opticflow-globe-logo"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div>
          <h1 id="brand-title" className="text-xl font-bold tracking-tight text-[#2D312E]" style={{ fontFamily: 'Georgia, serif' }}>Vision Eye Care</h1>
          <p id="brand-subtitle" className="text-[10px] text-[#8A847C] uppercase tracking-wider font-medium font-sans">Specs Store & Clinic</p>
        </div>
      </div>

      {/* Search Input */}
      <div id="search-section" className="p-4 border-b border-[#E6E2D8]">
        <div id="search-input-wrapper" className="relative">
          <input
            id="search-customer-input"
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E6E2D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#708271]/50 transition-all text-[#4A443E] placeholder-[#8A847C]/80"
          />
          <Search id="search-icon" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A847C]" size={16} />
        </div>
        
        <button
          id="add-customer-btn"
          onClick={() => setShowAddModal(true)}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-white border border-[#E6E2D8] rounded-xl text-sm font-semibold text-[#708271] hover:bg-[#FAF9F6] active:bg-[#F2F0EB] transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Register Patient (F1)
        </button>
      </div>

      {/* Customers List */}
      <div id="customers-scroll-list" className="flex-1 overflow-y-auto p-3 space-y-2">
        <div id="list-header" className="px-2 pb-1 flex justify-between items-center text-[10px] font-bold text-[#8A847C] uppercase tracking-wider">
          <span>Patient Roster</span>
          <span>{filteredCustomers.length} Total</span>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div id="empty-patients-tip" className="p-8 text-center text-xs text-[#8A847C]">
            No customers found matching that query.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isActive = activeCustomer?.id === c.id;
            const initials = c.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

             return (
              <div
                key={c.id}
                className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-white shadow-md border-[#E6E2D8]'
                    : 'border-transparent hover:bg-white/50'
                }`}
              >
                <button
                  id={`customer-row-${c.id}`}
                  onClick={() => onSelectCustomer(c)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left focus:outline-none cursor-pointer"
                >
                  <div id={`initials-badge-${c.id}`} className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-sm shrink-0 ${
                    isActive ? 'bg-[#708271] text-white' : 'bg-[#E6E2D8] text-[#708271]'
                  }`}>
                    {initials}
                  </div>
                  <div id={`customer-text-meta-${c.id}`} className="flex-1 min-w-0">
                    <p id={`customer-name-${c.id}`} className="text-sm font-bold text-[#2D312E] truncate font-serif">{c.name}</p>
                    <p id={`customer-phone-${c.id}`} className="text-xs text-[#8A847C]/90 flex items-center gap-1">
                      <Phone size={10} /> {c.mobile}
                    </p>
                  </div>
                </button>
                <div id={`actions-${c.id}`} className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#E8E6E1] text-[#4A443E] rounded-md font-mono font-bold">
                    {c.customerSince.split(' ')[1] || c.customerSince}
                  </span>
                  {onDeleteCustomer && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomer(c.id);
                      }}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Permanently remove customer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Customer Registration Modal Dialog */}
      {showAddModal && (
        <div id="add-customer-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="add-customer-modal-body" className="bg-white rounded-[2rem] border border-[#E6E2D8] p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 id="modal-title" className="text-lg font-bold text-[#2D312E] font-serif mb-4 flex items-center gap-2">
              <UserPlus className="text-[#708271]" />
              Register New Customer
            </h3>
            <p id="modal-description" className="text-xs text-[#8A847C] mb-4">
              Add a new customer to the database. Prescriptions and bills can be written immediately after.
            </p>
            <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label id="label-name" className="block text-xs font-semibold text-[#4A443E] mb-1">Full Name *</label>
                <input
                  id="input-name"
                  type="text"
                  required
                  placeholder="e.g. Balaji Venkat"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#708271]"
                />
              </div>
              
              <div>
                <label id="label-mobile" className="block text-xs font-semibold text-[#4A443E] mb-1 font-sans">Mobile Number *</label>
                <input
                  id="input-mobile"
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#708271]"
                />
              </div>

              <div>
                <label id="label-email" className="block text-xs font-semibold text-[#4A443E] mb-1">Email Address</label>
                <input
                  id="input-email"
                  type="email"
                  placeholder="e.g. balaji@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#708271]"
                />
              </div>

              <div id="modal-btn-row" className="pt-2 flex justify-end gap-2">
                <button
                  id="modal-cancel-btn"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E6E2D8] text-xs font-bold text-[#8A847C] rounded-xl hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  id="modal-submit-btn"
                  type="submit"
                  className="px-4 py-2 bg-[#708271] text-white text-xs font-bold rounded-xl hover:bg-[#617162] shadow-md shadow-[#708271]/20"
                >
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
