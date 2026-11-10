import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  RefreshCw, 
  Link2, 
  Calendar, 
  Ban, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Lock,
  ExternalLink
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export function AiRecoveryChatbox({ customer, onPaymentRecovered, onOptOutChanged }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendActive, setBackendActive] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history from backend on customer select
  useEffect(() => {
    if (!customer) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/chat/${customer.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendActive(true);
            setMessages(data.messages.map(m => ({
              id: m.id,
              sender: m.sender,
              text: m.message,
              action: m.action_taken,
              intent: m.intent,
              timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'
            })));
          }
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to local default intro if backend is unreachable
      }

      if (isMounted) {
        setBackendActive(false);
        const amountFormatted = `₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        const initialIntro = {
          id: 'intro-client',
          sender: 'ai',
          text: `Hello ${customer.name}, I am RecoverAI's automated AI recovery assistant on behalf of ${customer.company}.\n\nOur system detected that your scheduled autopay of ${amountFormatted} for invoice ${customer.invoiceId} encountered an error: "${customer.failureReason}".\n\nI can assist you with 5 safe actions: Retry Payment, Request Payment Link, Schedule Callback, Opt Out, or Talk to Human. How would you like to proceed?`,
          timestamp: 'Just now',
          action: null
        };
        setMessages([initialIntro]);
        setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [customer?.id, customer?.invoiceId]);

  const handleSendMessage = async (textToSend, explicitIntent = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `cust-${Date.now()}`,
      sender: 'customer',
      text,
      timestamp: 'Just now',
      action: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Call Backend API
    try {
      const res = await fetch(`${API_BASE}/api/chat/${customer.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          intent: explicitIntent,
          idempotency_key: explicitIntent === 'retry_payment' ? `ui-retry-${customer.id}-${Date.now()}` : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBackendActive(true);

        const aiMsg = {
          id: `ai-${data.message_id || Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: 'Just now',
          action: data.action_taken,
          intent: data.intent,
          txnRef: data.transaction_reference,
          payLink: data.payment_link
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);

        // Propagate state updates back to React Context
        if (data.action_taken === 'payment_retried_success' && onPaymentRecovered) {
          onPaymentRecovered(customer.id, data.transaction_reference);
        }
        if (data.action_taken === 'opted_out' && onOptOutChanged) {
          onOptOutChanged(customer.id, true);
        }
        return;
      }
    } catch (err) {
      // Backend not running; process client-side safely
    }

    // Client-side fallback handler
    setTimeout(() => {
      let reply = '';
      let action = null;
      let payLink = null;
      let txnRef = null;

      const lower = text.toLowerCase();

      // Check card security
      if (/\b\d{13,19}\b/.test(lower.replace(/[\s-]/g, '')) || /cvv|otp/.test(lower)) {
        reply = '⚠️ Security Notice: RecoverAI strictly adheres to PCI-DSS standards. We never collect or store card numbers, CVVs, or OTPs in chat. Please request a secure payment link.';
        action = 'sensitive_blocked';
      } else if (explicitIntent === 'opt_out' || /opt out|stop|unsubscribe|dnc/.test(lower)) {
        reply = `Understood, ${customer.name}. Your preference has been recorded in our Do Not Contact compliance registry. All automated outreach is now suppressed.`;
        action = 'opted_out';
        if (onOptOutChanged) onOptOutChanged(customer.id, true);
      } else if (explicitIntent === 'retry_payment' || /retry|try again|charge/.test(lower)) {
        if (customer.paymentStatus === 'Recovered') {
          reply = `Invoice ${customer.invoiceId} has already been verified and settled successfully. No additional retry is necessary.`;
          action = 'already_recovered';
        } else if (customer.optedOut) {
          reply = 'This account is currently registered as Opted Out (DNC). Automated retries are suspended.';
          action = 'opted_out_suppressed';
        } else {
          txnRef = `SIM-TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          reply = `✅ Success! Instant payment retry of ₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} for invoice ${customer.invoiceId} has been verified settled by the payment simulator.\n\nTransaction Reference: ${txnRef}`;
          action = 'payment_retried_success';
          if (onPaymentRecovered) onPaymentRecovered(customer.id, txnRef);
        }
      } else if (explicitIntent === 'request_link' || /link|send link|pay online/.test(lower)) {
        payLink = `https://pay.recoverai.io/checkout/${customer.invoiceId}?token=tok_sim_${Date.now()}`;
        reply = `Here is your secure, 256-bit encrypted payment link for invoice ${customer.invoiceId} (₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}):\n\n${payLink}\n\nYou can use this link to complete the payment via UPI, Card, or NetBanking.`;
        action = 'link_dispatched';
      } else if (explicitIntent === 'schedule_callback' || /callback|call later|tomorrow/.test(lower)) {
        reply = `📅 A callback has been scheduled for invoice ${customer.invoiceId}. Our accounts team will contact you at ${customer.phone || 'your phone on file'} during business hours.`;
        action = 'callback_scheduled';
      } else if (explicitIntent === 'talk_to_human' || /human|agent|representative|speak/.test(lower)) {
        reply = `👤 I have escalated your request to a senior billing specialist. A human representative will review invoice ${customer.invoiceId} and reach out to you directly.`;
        action = 'escalated_to_human';
      } else {
        reply = `Invoice ${customer.invoiceId} (${customer.failureReason}) has a pending balance of ₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. You can retry the payment, request a link, schedule a callback, opt out, or speak to a human.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: 'Just now',
          action,
          txnRef,
          payLink
        }
      ]);
      setIsLoading(false);
    }, 600);
  };

  const handleResetChat = async () => {
    try {
      await fetch(`${API_BASE}/api/chat/${customer.id}/history`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    const amountFormatted = `₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: 'ai',
        text: `Hello ${customer.name}, I am RecoverAI's automated AI recovery assistant on behalf of ${customer.company}.\n\nOur system detected that your scheduled autopay of ${amountFormatted} for invoice ${customer.invoiceId} encountered an error: "${customer.failureReason}".\n\nHow would you like to handle this payment?`,
        timestamp: 'Just now',
        action: null
      }
    ]);
  };

  const isRecovered = customer.paymentStatus === 'Recovered';
  const isOptedOut = customer.optedOut;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Chat Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17243A]">RecoverAI Assistant</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Transparent AI Recovery • {customer.invoiceId}
            </span>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Restart Conversation"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Messages Stream */}
      <div className="p-4 overflow-y-auto space-y-3.5 max-h-[360px] min-h-[220px] bg-slate-50/40 text-xs">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 shadow-2xs space-y-1.5 leading-relaxed ${
                  isAi
                    ? 'bg-white border border-slate-200 text-[#17243A]'
                    : 'bg-[#17243A] text-white'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.text}
                </div>

                {msg.payLink && (
                  <div className="pt-2">
                    <a
                      href={msg.payLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-100 transition-colors text-[11px]"
                    >
                      <Lock className="w-3 h-3 text-blue-600" />
                      <span>Open 256-Bit Payment Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div
                  className={`text-[10px] flex items-center justify-between gap-2 pt-1 border-t ${
                    isAi
                      ? 'border-slate-100 text-slate-400'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <span>{isAi ? 'RecoverAI Assistant' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {!isAi && (
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-8 italic">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
            <span>RecoverAI is processing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Chips (The 5 Actions) */}
      <div className="p-3 bg-white border-t border-slate-200/70 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Recovery Actions
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Action 1: Retry Payment */}
          <button
            type="button"
            disabled={isLoading || isRecovered || isOptedOut}
            onClick={() => handleSendMessage('Please retry my payment now', 'retry_payment')}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Retry Payment</span>
          </button>

          {/* Action 2: Request Payment Link */}
          <button
            type="button"
            disabled={isLoading || isRecovered}
            onClick={() => handleSendMessage('Please send me a secure payment link', 'request_link')}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Request Payment Link</span>
          </button>

          {/* Action 3: Schedule Callback */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage('Please schedule a callback with me tomorrow', 'schedule_callback')}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Schedule Callback</span>
          </button>

          {/* Action 4: Opt Out (DNC) */}
          <button
            type="button"
            disabled={isLoading || isOptedOut}
            onClick={() => handleSendMessage('I would like to opt out of recovery notifications', 'opt_out')}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            <span>Opt Out</span>
          </button>

          {/* Action 5: Talk to Human */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage('I would like to talk to a human representative', 'talk_to_human')}
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Talk to Human</span>
          </button>
        </div>
      </div>

      {/* 4. Text Input & Security Disclaimer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message or question about your payment..."
            disabled={isLoading}
            className="flex-1 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs text-[#17243A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
          <span className="flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-slate-400" />
            Zero Card Data Collection (PCI-DSS Strict)
          </span>
          <span>{backendActive ? '● SQLite Synced' : '● Local Simulation'}</span>
        </div>
      </div>
    </div>
  );
}

