import { useState, FormEvent } from 'react';
import { Customer, Prescription } from '../types';
import { Plus, Check, Trash2, Milestone, ChevronRight, FileText } from 'lucide-react';

interface PrescriptionHistoryProps {
  customer: Customer;
  onAddPrescription: (prescription: Prescription) => void;
}

export default function PrescriptionHistory({
  customer,
  onAddPrescription,
}: PrescriptionHistoryProps) {
  const [selectedRxId, setSelectedRxId] = useState<string | null>(
    customer.prescriptions[0]?.id || null
  );
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctorName, setDoctorName] = useState('Kiran Shantaram Sanap');
  
  // Right Eye State
  const [odSph, setOdSph] = useState('-1.00');
  const [odCyl, setOdCyl] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [odAdd, setOdAdd] = useState('0.00');
  const [odVa, setOdVa] = useState('6/6');

  // Left Eye State
  const [osSph, setOsSph] = useState('-1.00');
  const [osCyl, setOsCyl] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [osAdd, setOsAdd] = useState('0.00');
  const [osVa, setOsVa] = useState('6/6');

  // Common State
  const [pd, setPd] = useState('63');
  const [notes, setNotes] = useState('');

  // If selected prescription does not exist in this customer, default to latest
  const prescriptions = customer.prescriptions;
  const activeRx = prescriptions.find((r) => r.id === selectedRxId) || prescriptions[0] || null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
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
      notes,
    };
    onAddPrescription(newRx);
    setSelectedRxId(newRx.id);
    setShowAddForm(false);
    // Reset secondary values
    setNotes('');
  };

  return (
    <div id="prescription-history-container" className="bg-white p-6 rounded-[2rem] border border-[#E6E2D8] flex flex-col h-full overflow-hidden">
      <div id="rx-header" className="flex justify-between items-center mb-4">
        <div>
          <h2 id="rx-title" className="text-xs font-bold uppercase tracking-widest text-[#708271]">Diagnostics Ledger</h2>
          <p id="rx-subtitle" className="text-sm text-[#8A847C]">Prescription progression logs</p>
        </div>
        <button
          id="toggle-add-rx-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#708271] text-white text-xs font-semibold rounded-xl hover:bg-[#617162] transition-colors"
        >
          {showAddForm ? 'View Logs' : <><Plus size={14} /> New RX</>}
        </button>
      </div>

      {showAddForm ? (
        <form id="add-prescription-form" onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div id="doctor-pd-row" className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label id="label-doc" className="block text-stone-500 font-bold mb-1">Doctor Name</label>
              <input
                id="rx-doctor-name"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-lg"
              />
            </div>
            <div>
              <label id="label-pd" className="block text-stone-500 font-bold mb-1">Pupil Distance (PD) mm</label>
              <input
                id="rx-pd-val"
                type="text"
                value={pd}
                onChange={(e) => setPd(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#FAF9F6] border border-[#E6E2D8] rounded-lg"
              />
            </div>
          </div>

          {/* Right Eye (OD) Chart Card */}
          <div id="od-diagnostic-box" className="p-3 bg-[#E8E6E1]/40 border border-[#E6E2D8] rounded-2xl">
            <h4 id="od-box-label" className="text-xs font-bold text-[#708271] uppercase tracking-wider mb-2">Right Eye (Oculus Dexter - OD)</h4>
            <div id="od-inputs-grid" className="grid grid-cols-5 gap-1.5 text-xs">
              <div>
                <label id="od-sph" className="text-[10px] text-stone-500">SPH</label>
                <input type="text" value={odSph} onChange={(e) => setOdSph(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="od-cyl" className="text-[10px] text-stone-500">CYL</label>
                <input type="text" value={odCyl} onChange={(e) => setOdCyl(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="od-axis" className="text-[10px] text-stone-500">AXIS</label>
                <input type="text" value={odAxis} onChange={(e) => setOdAxis(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="od-add" className="text-[10px] text-stone-500">ADD</label>
                <input type="text" value={odAdd} onChange={(e) => setOdAdd(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="od-va" className="text-[10px] text-stone-500">VA</label>
                <input type="text" value={odVa} onChange={(e) => setOdVa(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
            </div>
          </div>

          {/* Left Eye (OS) Chart Card */}
          <div id="os-diagnostic-box" className="p-3 bg-[#E8E6E1]/40 border border-[#E6E2D8] rounded-2xl">
            <h4 id="os-box-label" className="text-xs font-bold text-[#708271] uppercase tracking-wider mb-2">Left Eye (Oculus Sinister - OS)</h4>
            <div id="os-inputs-grid" className="grid grid-cols-5 gap-1.5 text-xs">
              <div>
                <label id="os-sph" className="text-[10px] text-stone-500">SPH</label>
                <input type="text" value={osSph} onChange={(e) => setOsSph(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="os-cyl" className="text-[10px] text-stone-500">CYL</label>
                <input type="text" value={osCyl} onChange={(e) => setOsCyl(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="os-axis" className="text-[10px] text-stone-500">AXIS</label>
                <input type="text" value={osAxis} onChange={(e) => setOsAxis(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="os-add" className="text-[10px] text-stone-500">ADD</label>
                <input type="text" value={osAdd} onChange={(e) => setOsAdd(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
              <div>
                <label id="os-va" className="text-[10px] text-stone-500">VA</label>
                <input type="text" value={osVa} onChange={(e) => setOsVa(e.target.value)} className="w-full text-center py-1 bg-white border border-[#E6E2D8] rounded" />
              </div>
            </div>
          </div>

          <div>
            <label id="notes-label" className="block text-xs font-semibold text-[#4A443E] mb-1">Practitioner Recommendations / Notes</label>
            <textarea
              id="rx-recommendation-notes"
              rows={2}
              placeholder="Recommended thin glass (1.67), anti-fog, computer lenses for heavy screen time use..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#708271]"
            />
          </div>

          <button
            id="save-prescription-submit-btn"
            type="submit"
            className="w-full py-2.5 bg-[#708271] text-white text-xs font-semibold rounded-xl hover:bg-[#617162]"
          >
            Commit Prescription
          </button>
        </form>
      ) : (
        <div id="rx-display-view" className="flex-1 flex flex-col overflow-hidden">
          {/* Historical Timeline Selection Tabs */}
          {prescriptions.length > 1 && (
            <div id="timeline-selection" className="flex gap-2 mb-4 overflow-x-auto pb-1.5 scrollbar-thin">
              {prescriptions.map((p) => (
                <button
                  id={`timeline-tab-${p.id}`}
                  key={p.id}
                  onClick={() => setSelectedRxId(p.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap transition-all ${
                    (activeRx?.id === p.id)
                      ? 'bg-[#E8E6E1] text-[#708271] border-[#708271]/30'
                      : 'bg-transparent border-stone-200 text-[#8A847C]'
                  }`}
                >
                  {p.date}
                </button>
              ))}
            </div>
          )}

          {activeRx ? (
            <div id="current-active-rx-card" className="flex-1 flex flex-col">
              {/* Doctor and Date Ribbon */}
              <div id="rx-meta-ribbon" className="flex justify-between items-center bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E2D8] mb-3 text-xs">
                <span>
                  <p id="rx-ribbon-doc-label" className="text-stone-400 font-medium text-[9px] uppercase">Ophthalmic Doctor</p>
                  <p id="rx-ribbon-doc-val" className="font-bold text-[#2D312E]">{activeRx.doctorName}</p>
                </span>
                <span className="text-right">
                  <p id="rx-ribbon-date-label" className="text-stone-400 font-medium text-[9px] uppercase">Test Date</p>
                  <p id="rx-ribbon-date-val" className="font-mono font-bold text-[#708271]">{activeRx.date}</p>
                </span>
              </div>

              {/* Data Table */}
              <div id="data-table-board" className="space-y-3 flex-1 overflow-y-auto pr-1">
                {/* OD */}
                <div id="view-od-panel" className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E6E2D8]">
                  <div className="flex justify-between items-center mb-1 border-b border-stone-100 pb-1">
                    <span className="text-[10px] font-extrabold text-[#708271] uppercase tracking-wider">OD (Right Eye Oculus Dexter)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-1 rounded">VA: {activeRx.odVa}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                    <div>
                      <p className="text-[9px] text-[#8A847C]">SPH</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.odSph}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">CYL</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.odCyl}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">AXIS</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.odAxis}°</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">ADD</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.odAdd}</p>
                    </div>
                  </div>
                </div>

                {/* OS */}
                <div id="view-os-panel" className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E6E2D8]">
                  <div className="flex justify-between items-center mb-1 border-b border-stone-100 pb-1">
                    <span className="text-[10px] font-extrabold text-[#708271] uppercase tracking-wider">OS (Left Eye Oculus Sinister)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-1 rounded">VA: {activeRx.osVa}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                    <div>
                      <p className="text-[9px] text-[#8A847C]">SPH</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.osSph}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">CYL</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.osCyl}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">AXIS</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.osAxis}°</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#8A847C]">ADD</p>
                      <p className="font-bold text-[#2D312E] mt-0.5">{activeRx.osAdd}</p>
                    </div>
                  </div>
                </div>

                {/* PD Details */}
                <div id="pd-details-panel" className="flex justify-between items-center px-3 py-2 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl text-xs font-mono font-bold">
                  <span className="text-stone-400 font-semibold font-sans">PUPIL DISTANCE (PD)</span>
                  <span className="text-[#708271]">{activeRx.pd} mm</span>
                </div>

                {/* RX Recommendation Notice */}
                {activeRx.notes && (
                  <div id="rx-recommendation-card" className="p-3 bg-[#E8E6E1]/50 rounded-xl border border-[#E6E2D8]/80 text-xs">
                    <p id="rx-recommend-label" className="font-semibold text-stone-500 uppercase text-[9px] tracking-wider mb-1">Clinical Recommendations</p>
                    <p id="rx-recommend-val" className="italic text-stone-700 leading-relaxed font-serif">"{activeRx.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div id="no-rx-alert" className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-[#FAF9F6] border border-dashed border-[#E6E2D8] rounded-2xl">
              <FileText className="text-[#8A847C] mb-2" size={32} />
              <p className="text-xs font-bold text-[#4A443E]">No active prescription ledger found.</p>
              <p className="text-[10px] text-[#8A847C] mt-1 mb-3">Add the patient's visual diagnostics parameters to enable progressive billing.</p>
              <button
                id="create-rx-empty-click"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1 bg-[#708271] text-white text-[10px] font-semibold rounded-lg"
              >
                Add Prescription
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
