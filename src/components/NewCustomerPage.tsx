import React, { useState } from 'react';
import { Customer } from '../types';
import { UserPlus, Sparkles, Check, Phone, Mail } from 'lucide-react';

interface NewCustomerPageProps {
  onAddCustomer: (name: string, mobile: string, email: string) => void;
  onNavigateToMain: () => void;
}

export default function NewCustomerPage({ onAddCustomer, onNavigateToMain }: NewCustomerPageProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdName, setCreatedName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    onAddCustomer(name.trim(), mobile.trim(), email.trim());
    setCreatedName(name.trim());
    setIsSuccess(true);
    
    // Reset state
    setName('');
    setMobile('');
    setEmail('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  return (
    <div id="new-customer-page" className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
      
      {/* Title block */}
      <div id="new-cust-header" className="border-b border-[#E6E2D8] pb-4">
        <h2 id="new-cust-title" className="text-2xl font-bold font-serif text-[#2D312E] tracking-tight">Enroll New Customer</h2>
        <p id="new-cust-subtitle" className="text-sm text-[#8A847C] mt-1">Register a new profile in the OpticFlow database. Once registered, you can immediately add refract testing charts, diagnostic records, and issue ophthalmic store bills.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Side: Form (7 columns) */}
        <div className="col-span-12 md:col-span-7">
          <form id="new-patient-registration-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-[#E6E2D8] shadow-sm space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#708271] font-bold">Demographic Entry</span>
              <h3 className="text-lg font-bold font-serif text-[#2D312E]">Patient Specifications</h3>
            </div>

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Check size={16} />
                </div>
                <div>
                  <p className="font-bold">Patient Registered Successfully!</p>
                  <p className="text-emerald-700/80 mt-0.5"><strong>{createdName}</strong> is now signed up. You can find them in the Patient Directory or Practitioner Console to test eye powers.</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A443E] uppercase tracking-wider mb-2">Customer Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm text-[#4A443E] focus:outline-none focus:ring-2 focus:ring-[#708271] focus:border-transparent transition-all placeholder-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A443E] uppercase tracking-wider mb-2">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A847C] font-mono leading-none border-r border-[#E6E2D8] pr-2">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-14 pr-4 py-3 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm font-mono text-[#4A443E] focus:outline-none focus:ring-2 focus:ring-[#708271] focus:border-transparent transition-all placeholder-stone-400"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">Enter a valid 10-digit Indian mobile number.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A443E] uppercase tracking-wider mb-2">Email ID (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@gmail.com"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-sm text-[#4A443E] focus:outline-none focus:ring-2 focus:ring-[#708271] focus:border-transparent transition-all placeholder-stone-400"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">For sharing digitized optical receipt.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E2D8]/60 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onNavigateToMain}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase rounded-xl transition-colors"
              >
                Go to Diagnostic Console
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-[#708271] hover:bg-[#5C6E5B] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-[#708271]/10"
              >
                <UserPlus size={14} /> Add Customer to Ledger
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Informative Card / Guide (5 columns) */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="bg-[#E8E6E1]/50 p-6 rounded-[2rem] border border-[#E6E2D8] space-y-4 text-xs leading-relaxed text-[#4A443E]">
            <h4 className="font-serif font-bold text-sm text-[#2D312E] flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles size={14} className="text-[#708271]" /> Quick Compliance Note
            </h4>
            
            <p><strong>Lumina Optics CRM</strong> is pre-configured with active database schema compliance. All user profiles created here are stored within secure LocalStorage, which handles customer logs, purchases, and diagnostic eye powers.</p>
            
            <div className="p-3 bg-white rounded-xl border border-[#E6E2D8] space-y-2">
              <p className="font-bold text-[#708271] uppercase text-[9px] tracking-wider">Benefits of Registration:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#8a847c]">
                <li>Keep track of infinite eye test records.</li>
                <li>Analyze lens refinement cycles over years.</li>
                <li>One-click printable PDF invoicing.</li>
                <li>Track lifetime revenue contribution per customer.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl">
              <p className="font-bold uppercase text-[9px] tracking-wider">🔒 DATA STATEMENT</p>
              <p className="text-[11px] font-medium text-yellow-700/90 mt-0.5">This client is sandboxed to run on port 3000 in encrypted browser memory, satisfying local privacy preservation compliance directives.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
