import React, { useState } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { Modal } from '../common/Modal';
import { 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Calendar, 
  Ban, 
  Headphones, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  Radio,
  Sparkles
} from 'lucide-react';

export function SimulationModal() {
  const { 
    isSimulatorOpen, 
    setIsSimulatorOpen, 
    simulatorTargetCustomerId, 
    customers, 
    recordSimulatedCall, 
    executePaymentSimulator 
  } = useRecovery();

  const [selectedCustId, setSelectedCustId] = useState(simulatorTargetCustomerId || 'CUST-1010');
  const [step, setStep] = useState(1); // 1: Select/Inspect, 2: AI Calling, 3: Decision Engine, 4: Result
  const [customerChoice, setCustomerChoice] = useState('retry');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync target customer if opened from a specific row
  React.useEffect(() => {
    if (simulatorTargetCustomerId) {
      setSelectedCustId(simulatorTargetCustomerId);
      setStep(1);
    }
  }, [simulatorTargetCustomerId]);

  const targetCustomer = customers.find(c => c.id === selectedCustId) || customers[0];

  const handleClose = () => {
    setIsSimulatorOpen(false);
    setStep(1);
    setIsProcessing(false);
  };

  const startVoiceCall = () => {
    setStep(2);
  };

  const submitCustomerResponse = async (choice) => {
    setCustomerChoice(choice);
    setStep(3);
    setIsProcessing(true);

    // Simulate backend decision engine latency
    await new Promise(r => setTimeout(r, 900));
    setIsProcessing(false);

    if (choice === 'retry') {
      // Step 7: Payment Simulator checks whether retry succeeds
      setIsProcessing(true);
      await executePaymentSimulator(targetCustomer.id);
      setIsProcessing(false);

      recordSimulatedCall({
        customerId: targetCustomer.id,
        outcome: 'Retry requested',
        aiConfidence: 97,
        intent: 'AUTHORIZE_RETRY_NOW',
        finalAction: 'Payment Simulator Retry Confirmed',
        transcript: [
          { speaker: 'AI', text: `Hi ${targetCustomer.name}, this is RecoverAI calling regarding your recent autopay payment of ₹${targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with reason '${targetCustomer.failureReason}'. Would you like me to run an instant retry right now?` },
          { speaker: 'Customer', text: "Yes, funds are available now. Please retry the charge." },
          { speaker: 'AI', text: "Submitting retry to payment processor now... Approved! Receipt sent to your email. Thank you!" }
        ],
        decisionLog: [
          { step: 'NLP Parse', result: 'Intent = AUTHORIZE_RETRY_NOW (Confidence: 97%)' },
          { step: 'Policy Validation', result: 'Customer authorized instant clearing' },
          { step: 'Payment Simulator', result: 'Status: SUCCESS, Auth Token: AUTH_LIVE_9021' }
        ]
      });
    } else if (choice === 'link') {
      recordSimulatedCall({
        customerId: targetCustomer.id,
        outcome: 'Payment link requested',
        aiConfidence: 94,
        intent: 'REQUEST_PAYMENT_LINK',
        finalAction: 'Secure 256-bit Payment Link Dispatched',
        transcript: [
          { speaker: 'AI', text: `Hello ${targetCustomer.name}, RecoverAI here regarding your ${targetCustomer.company} balance of ₹${targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. How can we assist today?` },
          { speaker: 'Customer', text: "I'd prefer to pay online using a different card. Can you text me a payment link?" },
          { speaker: 'AI', text: `Certainly! A secure payment link has been dispatched to ${targetCustomer.phone}.` }
        ],
        decisionLog: [
          { step: 'NLP Parse', result: 'Intent = REQUEST_PAYMENT_LINK (Confidence 94%)' },
          { step: 'Security Check', result: 'Recipient identity authenticated' },
          { step: 'Link Generation', result: 'Single-use token generated; SMS sent' }
        ]
      });
    } else if (choice === 'callback') {
      recordSimulatedCall({
        customerId: targetCustomer.id,
        outcome: 'Callback requested',
        aiConfidence: 91,
        intent: 'SCHEDULE_CALLBACK',
        finalAction: 'Callback Scheduled for Tomorrow 2:00 PM',
        transcript: [
          { speaker: 'AI', text: `Hi ${targetCustomer.name}, RecoverAI calling about your invoice of ₹${targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.` },
          { speaker: 'Customer', text: "Can you call me back tomorrow afternoon around 2 PM?" },
          { speaker: 'AI', text: "Done. I have scheduled a callback for tomorrow at 2:00 PM. Have a great day!" }
        ],
        decisionLog: [
          { step: 'NLP Parse', result: 'Intent = SCHEDULE_CALLBACK (Confidence 91%)' },
          { step: 'Calendar Allocation', result: 'Slot reserved in AI outbound queue' }
        ]
      });
    } else if (choice === 'decline') {
      recordSimulatedCall({
        customerId: targetCustomer.id,
        outcome: 'Declined',
        aiConfidence: 99,
        intent: 'DECLINE_AND_OPT_OUT',
        finalAction: 'Added to DNC Suppression Registry',
        transcript: [
          { speaker: 'AI', text: `Hello ${targetCustomer.name}, calling regarding your failed payment of ₹${targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.` },
          { speaker: 'Customer', text: "I do not want this service anymore. Stop calling me and cancel my subscription." },
          { speaker: 'AI', text: "Your request is confirmed. We have placed your number on our Do Not Call list." }
        ],
        decisionLog: [
          { step: 'NLP Parse', result: 'Intent = DECLINE_AND_OPT_OUT (Confidence 99%)' },
          { step: 'Compliance Action', result: 'Suppressed phone number from all recovery campaigns' }
        ]
      });
    } else if (choice === 'human') {
      recordSimulatedCall({
        customerId: targetCustomer.id,
        outcome: 'Escalated to human',
        aiConfidence: 62,
        intent: 'BILLING_DISPUTE_OR_COMPLEX',
        finalAction: 'Escalated to Dedicated Account Manager',
        transcript: [
          { speaker: 'AI', text: `Hi ${targetCustomer.name}, this is RecoverAI regarding your account.` },
          { speaker: 'Customer', text: "I have multiple billing errors on this statement that need a manual audit." },
          { speaker: 'AI', text: "I understand. I am escalating your file directly to a senior account manager for immediate manual review." }
        ],
        decisionLog: [
          { step: 'NLP Parse', result: 'Intent = BILLING_DISPUTE (Confidence: 62% < 75% threshold)' },
          { step: 'Safety Protocol', result: 'Auto-escalation triggered to prevent churn' }
        ]
      });
    }

    setStep(4);
  };

  return (
    <Modal
      isOpen={isSimulatorOpen}
      onClose={handleClose}
      title="RecoverAI Voice Agent & Decision Engine Simulator"
      subtitle="Interactive verification of the 8-step autopay recovery workflow"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2.5 text-xs">
          {[
            { num: 1, label: '1. Ingest & Check' },
            { num: 2, label: '2. AI Voice Call' },
            { num: 3, label: '3. Decision Engine' },
            { num: 4, label: '4. Verified Outcome' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl text-center font-bold border transition-colors ${
                step === s.num
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                  : step > s.num
                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Selection & Pre-Call Eligibility Inspection */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Customer Account For Simulation
              </label>
              <select
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="w-full h-11 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.company} (₹{c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} - {c.failureReason} [{c.recoveryStatus}])
                  </option>
                ))}
              </select>
            </div>

            {/* Eligibility summary */}
            <div className="bg-slate-50/90 rounded-xl p-5 border border-slate-200/90 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Pre-Call Recovery Eligibility Check
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  targetCustomer.optedOut ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {targetCustomer.optedOut ? 'SUPPRESSED (DNC)' : 'PASSED ELIGIBILITY'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-bold block mb-1">Failed Invoice</span>
                  <span className="font-bold text-[#17243A] block">{targetCustomer.invoiceId} (₹{targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] uppercase font-bold block mb-1">Failure Reason</span>
                  <span className="font-bold text-rose-700 block">{targetCustomer.failureReason} ({targetCustomer.failureCode})</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[11px] uppercase font-bold block mb-1">Do Not Call (DNC) Status</span>
                  <span className="font-semibold text-slate-800 block">
                    {targetCustomer.optedOut ? 'Opted Out (Calls blocked)' : 'Clean Record (Authorized)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[11px] uppercase font-bold block mb-1">Grace Window</span>
                  <span className="font-semibold text-slate-800 block">Day 2 of 7 (Eligible)</span>
                </div>
              </div>
            </div>

            {targetCustomer.optedOut ? (
              <div className="p-4.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Compliance Guardrail:</strong> This customer has opted out. AI calls are strictly suppressed to comply with TCPA / Do-Not-Call regulations. You can toggle their opt-out in customer details to test calling.
                </span>
              </div>
            ) : null}

            <div className="flex justify-end gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="h-11 px-5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={targetCustomer.optedOut}
                onClick={startVoiceCall}
                className="h-11 px-5.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Place Simulated AI Voice Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Voice Agent Call Dialogue Simulation */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-[#17243A] text-white rounded-xl shadow-2xs">
              <div className="flex items-center gap-3 text-xs">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold tracking-tight">Live Voice Session with {targetCustomer.name}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">00:18</span>
            </div>

            {/* AI Prompt */}
            <div className="p-5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs space-y-2 shadow-2xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Voice Agent (Aria):
              </span>
              <p className="text-slate-800 leading-relaxed text-sm font-medium">
                "Hello {targetCustomer.name}, this is RecoverAI calling on behalf of {targetCustomer.company}. Your autopay payment of ₹{targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} was declined by your bank due to {targetCustomer.failureReason.toLowerCase()}. How would you like to handle this balance today?"
              </p>
            </div>

            {/* Customer Response Options */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Simulate Customer Choice:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <button
                  onClick={() => submitCustomerResponse('retry')}
                  className="p-4 text-left border border-slate-200/90 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-emerald-800 text-[13px]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-600" />
                      1. Authorize Retry
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-2 text-xs font-medium">
                    "Funds are ready now, go ahead and retry the card right away."
                  </p>
                </button>

                <button
                  onClick={() => submitCustomerResponse('link')}
                  className="p-4 text-left border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-blue-800 text-[13px]">
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      2. Send Payment Link
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-2 text-xs font-medium">
                    "Text me a secure link and I'll update my payment method online."
                  </p>
                </button>

                <button
                  onClick={() => submitCustomerResponse('callback')}
                  className="p-4 text-left border border-slate-200/90 hover:border-purple-500 hover:bg-purple-50/50 rounded-xl transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-purple-800 text-[13px]">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      3. Schedule Callback
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-2 text-xs font-medium">
                    "I am busy right now, please call me tomorrow afternoon."
                  </p>
                </button>

                <button
                  onClick={() => submitCustomerResponse('human')}
                  className="p-4 text-left border border-slate-200/90 hover:border-amber-500 hover:bg-amber-50/50 rounded-xl transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 group-hover:text-amber-800 text-[13px]">
                    <span className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-amber-600" />
                      4. Dispute / Human Help
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-2 text-xs font-medium">
                    "There's an error in this bill, I need to speak to an account manager."
                  </p>
                </button>

                <button
                  onClick={() => submitCustomerResponse('decline')}
                  className="p-4 text-left border border-slate-200/90 hover:border-slate-500 hover:bg-slate-100 sm:col-span-2 rounded-xl transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 text-[13px]">
                    <span className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-slate-600" />
                      5. Decline & Opt Out
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mt-2 text-xs font-medium">
                    "Stop calling me. Cancel my service and put me on your do-not-call list."
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Backend Decision Engine Validation */}
        {step === 3 && (
          <div className="py-14 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#17243A]">Backend Decision Engine Processing...</h4>
              <p className="text-xs text-slate-500 mt-1.5">
                Validating customer response, evaluating confidence threshold, and executing simulator policy.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Verified Recovery Outcome */}
        {step === 4 && (
          <div className="space-y-5">
            <div className={`p-5 rounded-xl border ${
              customerChoice === 'retry'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : customerChoice === 'decline'
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : customerChoice === 'human'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <h4 className="font-bold text-sm">
                    {customerChoice === 'retry' && 'Payment Verified & Recovered!'}
                    {customerChoice === 'link' && 'Secure Tokenized Link Dispatched'}
                    {customerChoice === 'callback' && 'Callback Queued in Schedule'}
                    {customerChoice === 'human' && 'Escalated to Human Representative'}
                    {customerChoice === 'decline' && 'Opt-Out Registered & Calls Suppressed'}
                  </h4>
                  <p className="opacity-90 leading-relaxed text-xs">
                    {customerChoice === 'retry' &&
                      `The Payment Simulator processed the retry successfully. ₹${targetCustomer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to Amount Recovered.`}
                    {customerChoice === 'link' &&
                      `Customer requested a direct link. Note: Status remains pending until customer pays through the link.`}
                    {customerChoice === 'callback' &&
                      `Follow-up scheduled. Autopay remains pending until confirmation.`}
                    {customerChoice === 'human' &&
                      `Low AI confidence triggered safety handoff to protect customer relationship.`}
                    {customerChoice === 'decline' &&
                      `Customer added to Do Not Call registry. No further automated calls will be placed.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/90 rounded-xl p-5 text-xs font-mono border border-slate-200 space-y-2.5 text-slate-700 shadow-2xs">
              <div className="font-bold text-[#17243A] font-sans text-xs">Decision Engine Audit Trail:</div>
              <div>• Customer: {targetCustomer.name} ({targetCustomer.company})</div>
              <div>• Recognized Intent: {customerChoice.toUpperCase()}</div>
              <div>• AI Confidence: {customerChoice === 'human' ? '62%' : '96%'}</div>
              <div>• Status: {customerChoice === 'retry' ? 'VERIFIED RECOVERED' : 'PENDING'}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="h-11 px-6 text-xs font-semibold text-white bg-[#17243A] hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
