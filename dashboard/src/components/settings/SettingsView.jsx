import React, { useState } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  Bot, 
  ShieldCheck, 
  Clock, 
  Ban, 
  Check, 
  Sliders
} from 'lucide-react';

export function SettingsView() {
  const { settings, setSettings } = useRecovery();
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#17243A] tracking-tight">
            Engine & Compliance Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure AI voice behavior, recovery eligibility rules, and strict TCPA/DNC guardrails.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Agent Configuration */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-7 shadow-subtle space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                AI Voice Agent Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Persona modeling and real-time accuracy thresholds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Agent Persona & Voice Model
              </label>
              <select
                value={formData.voiceTone}
                onChange={(e) => handleChange('voiceTone', e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
              >
                <option value="Professional & Empathetic">Aria — Professional & Empathetic (Recommended)</option>
                <option value="Direct & Efficient">Marcus — Direct & Efficient</option>
                <option value="Casual & Consultative">Elena — Casual & Consultative</option>
              </select>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Tuned for recurring B2B SaaS and high-ticket customer retention.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Human Escalation Confidence Threshold (%)
              </label>
              <div className="flex items-center gap-4 h-11">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={formData.humanEscalationThreshold}
                  onChange={(e) => handleChange('humanEscalationThreshold', parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-[#17243A] text-sm min-w-10">
                  {formData.humanEscalationThreshold}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Calls with AI intent confidence below this score are automatically routed to human reps.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Recovery Eligibility Rules */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-7 shadow-subtle space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                Recovery Eligibility Rules
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Filtering criteria for automated voice outreach campaigns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Minimum Invoice Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.minInvoiceThreshold}
                onChange={(e) => handleChange('minInvoiceThreshold', parseFloat(e.target.value))}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium"
              />
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Invoices below this amount bypass voice outreach and receive automated email only.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Post-Failure Grace Period (Days)
              </label>
              <input
                type="number"
                value={formData.gracePeriodDays}
                onChange={(e) => handleChange('gracePeriodDays', parseInt(e.target.value))}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium"
              />
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Hours/days before the voice agent initiates the first recovery call attempt.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Calling Preferences */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-7 shadow-subtle space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                Calling Window & Frequency Preferences
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Scheduling limits and daily touchpoint caps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Window Start (Local Time)
              </label>
              <input
                type="time"
                value={formData.callingWindowStart}
                onChange={(e) => handleChange('callingWindowStart', e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Window End (Local Time)
              </label>
              <input
                type="time"
                value={formData.callingWindowEnd}
                onChange={(e) => handleChange('callingWindowEnd', e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Max Call Attempts Per Invoice
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.maxAttempts}
                onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium"
              />
            </div>
          </div>

          {/* Weekend Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#17243A] block">Weekend Outreach Policy</span>
              <span className="text-xs text-slate-400">Allow AI voice agent to place calls on Saturday / Sunday</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('weekendCalling')}
              className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                formData.weekendCalling ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                formData.weekendCalling ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Section 4: Opt-Out Protection & Compliance */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-7 shadow-subtle space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">
                Opt-Out Protection & TCPA Compliance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated regulatory suppression guardrails</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#17243A] block">Strict Do-Not-Call (DNC) Enforcement</span>
                <span className="text-xs text-slate-400">
                  Immediately suppress any customer who utters opt-out keywords or requests cancellation.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('strictDncEnforcement')}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  formData.strictDncEnforcement ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                  formData.strictDncEnforcement ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block font-semibold text-slate-700 text-xs">
                Auto-Suppression Trigger Keywords
              </label>
              <input
                type="text"
                value={formData.autoOptOutKeywords}
                onChange={(e) => handleChange('autoOptOutKeywords', e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-medium"
              />
              <p className="text-[11px] text-slate-400 font-medium pt-1">
                Comma-separated regex phrases recognized by speech-to-text during live conversation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => setFormData(settings)}
            className="h-11 px-5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="h-11 px-6 text-xs font-semibold text-white bg-[#17243A] hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
