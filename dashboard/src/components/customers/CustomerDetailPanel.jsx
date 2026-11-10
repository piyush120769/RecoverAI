import React, { useState } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { SlideOver } from '../common/SlideOver';
import { AiRecoveryChatbox } from '../chat/AiRecoveryChatbox';
import { 
  PaymentStatusBadge, 
  RecoveryStatusBadge, 
  FailureReasonBadge 
} from '../common/Badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  AlertCircle, 
  ShieldCheck, 
  PhoneCall, 
  RefreshCw, 
  Send, 
  Ban, 
  CheckCircle2,
  Clock,
  Hash,
  AlertTriangle,
  Sparkles,
  Bot
} from 'lucide-react';

export function CustomerDetailPanel() {
  const { 
    selectedCustomerId, 
    setSelectedCustomerId, 
    customers, 
    calls,
    setIsSimulatorOpen,
    setSimulatorTargetCustomerId,
    executePaymentSimulator,
    dispatchPaymentLink,
    toggleCustomerOptOut
  } = useRecovery();

  const [isRetrying, setIsRetrying] = useState(false);

  if (!selectedCustomerId) return null;

  const customer = customers.find(c => c.id === selectedCustomerId);
  if (!customer) return null;

  const customerCalls = calls.filter(call => call.customerId === customer.id);

  const handleSimulatePayment = async () => {
    setIsRetrying(true);
    await executePaymentSimulator(customer.id);
    setIsRetrying(false);
  };

  const handleTriggerAiCall = () => {
    setSimulatorTargetCustomerId(customer.id);
    setIsSimulatorOpen(true);
  };

  const handleChatPaymentRecovered = (customerId, txnRef) => {
    executePaymentSimulator(customerId);
  };

  const handleChatOptOutChanged = (customerId, isOptedOut) => {
    if (customer.optedOut !== isOptedOut) {
      toggleCustomerOptOut(customerId);
    }
  };

  return (
    <SlideOver
      isOpen={!!selectedCustomerId}
      onClose={() => setSelectedCustomerId(null)}
      title="Customer Recovery Profile"
      subtitle={`${customer.invoiceId} • ${customer.company}`}
      width="max-w-[660px]"
    >
      {/* 1. Payment Summary Card */}
      <div className={`p-6 rounded-xl border space-y-4 ${
        customer.paymentStatus === 'Recovered'
          ? 'bg-emerald-50/60 border-emerald-200'
          : customer.optedOut
          ? 'bg-slate-100/80 border-slate-200'
          : 'bg-slate-50/90 border-slate-200/90'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={customer.paymentStatus} />
            <RecoveryStatusBadge status={customer.recoveryStatus} />
          </div>
          {customer.paymentStatus === 'Recovered' && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Cleared
            </span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Failed Autopay Amount
          </span>
          <div className="text-3xl font-extrabold text-[#17243A] font-sans">
            ₹{customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium pt-2 border-t border-slate-200/70">
          {customer.paymentStatus === 'Recovered'
            ? `Recovered on ${customer.recoveredAt} via ${customer.recoveredMethod}. Payment simulator confirmed settled funds in merchant bank account.`
            : customer.optedOut
            ? 'Customer requested Do Not Call / Contact. Automated communications are suppressed to comply with TCPA / TRAI compliance regulations.'
            : `Autopay recovery active. Next touchpoint configured based on error specification (${customer.failureCode}).`}
        </p>
      </div>

      {/* 2. Primary Interactive AI Recovery Chatbox */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-blue-600" />
            AI Recovery Assistant (Chat-First)
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">PCI-DSS Safe</span>
        </div>
        <AiRecoveryChatbox
          customer={customer}
          onPaymentRecovered={handleChatPaymentRecovered}
          onOptOutChanged={handleChatOptOutChanged}
        />
      </div>

      {/* 3. Manual Administrative Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Manual Administrative Controls
        </h4>
        <div className="grid grid-cols-2 gap-3.5">
          {/* Action 1: Simulate Retry */}
          <button
            disabled={isRetrying || customer.paymentStatus === 'Recovered' || customer.optedOut}
            onClick={handleSimulatePayment}
            className="h-11 px-4 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 shrink-0 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Instant Retry Simulation'}</span>
          </button>

          {/* Action 2: Send Payment Link */}
          <button
            disabled={customer.paymentStatus === 'Recovered'}
            onClick={() => dispatchPaymentLink(customer.id)}
            className="h-11 px-4 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Send Payment Link</span>
          </button>

          {/* Action 3: Opt Out (DNC) */}
          <button
            onClick={() => toggleCustomerOptOut(customer.id)}
            className={`h-11 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer ${
              customer.optedOut
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Ban className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{customer.optedOut ? 'Remove from DNC' : 'Opt Out (DNC)'}</span>
          </button>

          {/* Action 4: Voice Call Simulator (Optional Reference) */}
          <button
            disabled={customer.optedOut || customer.paymentStatus === 'Recovered'}
            onClick={handleTriggerAiCall}
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Legacy Call Sim</span>
          </button>
        </div>
      </div>

      {/* 4. Customer Information: Vertically Organized Information Blocks */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Customer & Account Details
        </h4>
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Company
            </span>
            <div className="text-sm font-semibold text-[#17243A]">
              {customer.company}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Contact Name
            </span>
            <div className="text-sm font-semibold text-[#17243A]">
              {customer.name}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Email
            </span>
            <div className="text-sm font-mono text-slate-700">
              {customer.email}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Phone (Masked)
            </span>
            <div className="text-sm font-mono text-slate-700">
              {customer.phone}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Subscription Plan
            </span>
            <div className="text-sm font-medium text-slate-800">
              {customer.plan}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Failed Payment Details: Vertically Stacked Information Blocks */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Failed Payment Details
        </h4>
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Invoice ID
            </span>
            <div className="text-sm font-mono font-bold text-[#17243A]">
              {customer.invoiceId}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Scheduled Due Date
            </span>
            <div className="text-sm font-medium text-slate-700">
              {customer.dueDate}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Detected Failure Reason
            </span>
            <div className="mt-1">
              <FailureReasonBadge reason={customer.failureReason} />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Bank Error Code
            </span>
            <div className="inline-block font-mono text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 text-xs">
              {customer.failureCode}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Eligibility Status
            </span>
            <div className={`text-sm font-semibold ${customer.optedOut ? 'text-slate-500' : 'text-emerald-700'}`}>
              {customer.optedOut ? 'Suppressed (DNC Requested)' : 'Eligible for AI Recovery'}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Event Audit Trail */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Recovery Event Audit Trail
        </h4>
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="border-l-2 border-slate-200 pl-4 space-y-4 text-xs">
            {customer.timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[22px] top-1 ring-4 ring-white"></span>
                <div className="text-[11px] font-mono text-slate-400 font-medium">{item.timestamp}</div>
                <div className="text-[#17243A] mt-0.5 font-medium leading-relaxed">{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideOver>
  );
}
