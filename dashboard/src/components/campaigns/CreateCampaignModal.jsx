import React, { useState } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { Modal } from '../common/Modal';
import { Sparkles } from 'lucide-react';

export function CreateCampaignModal() {
  const { isCreateCampaignOpen, setIsCreateCampaignOpen, createCampaign, customers } = useRecovery();

  const [name, setName] = useState('');
  const [filterReason, setFilterReason] = useState('ALL');
  const [voiceTone, setVoiceTone] = useState('Professional / Concierge');
  const [minAmount, setMinAmount] = useState('5000');

  const eligibleCount = customers.filter(c => {
    if (c.optedOut || c.paymentStatus === 'Recovered') return false;
    if (filterReason !== 'ALL' && c.failureReason !== filterReason) return false;
    if (c.amount < parseFloat(minAmount || 0)) return false;
    return true;
  }).length;

  const targetAmount = customers
    .filter(c => {
      if (c.optedOut || c.paymentStatus === 'Recovered') return false;
      if (filterReason !== 'ALL' && c.failureReason !== filterReason) return false;
      if (c.amount < parseFloat(minAmount || 0)) return false;
      return true;
    })
    .reduce((sum, c) => sum + c.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCampaign({
      name,
      voiceTone,
      eligibleCount: eligibleCount || 2,
      amountTarget: targetAmount || 35000
    });

    setName('');
    setIsCreateCampaignOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateCampaignOpen}
      onClose={() => setIsCreateCampaignOpen(false)}
      title="Create Recovery Campaign"
      subtitle="Define audience criteria and AI voice agent behavior"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700 text-xs">
            Campaign Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. High-Risk Autopay Mandate Recovery"
            className="w-full h-11 text-xs sm:text-sm rounded-xl border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700 text-xs">
            Target Failure Reason
          </label>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="w-full h-11 text-xs sm:text-sm rounded-xl border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium cursor-pointer"
          >
            <option value="ALL">All Eligible Reasons</option>
            <option value="Insufficient Funds">Insufficient Funds</option>
            <option value="Bank Declined">Bank Declined</option>
            <option value="Mandate Inactive">Mandate Inactive</option>
            <option value="Payment Timeout">Payment Timeout</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 text-xs">
              Minimum Invoice (₹)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full h-11 text-xs sm:text-sm rounded-xl border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700 text-xs">
              AI Voice Persona
            </label>
            <select
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value)}
              className="w-full h-11 text-xs sm:text-sm rounded-xl border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium cursor-pointer"
            >
              <option value="Professional / Concierge">Professional / Concierge</option>
              <option value="Friendly / Supportive">Friendly / Supportive</option>
              <option value="Informative / Direct">Informative / Direct</option>
            </select>
          </div>
        </div>

        {/* Dynamic Audience Preview */}
        <div className="p-4.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between text-slate-700 shadow-2xs">
          <div>
            <span className="text-slate-500 block text-xs font-medium">Matching Eligible Customers:</span>
            <span className="font-bold text-[#17243A] text-sm mt-0.5 block">{eligibleCount} accounts</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-xs font-medium">Target Revenue:</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block font-mono">₹{targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => setIsCreateCampaignOpen(false)}
            className="h-11 px-5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Campaign</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
