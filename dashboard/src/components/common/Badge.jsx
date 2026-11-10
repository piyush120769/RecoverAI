import React from 'react';

export function PaymentStatusBadge({ status }) {
  if (status === 'Recovered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Verified Recovered
      </span>
    );
  }
  if (status === 'Processing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Processing
      </span>
    );
  }
  // Failed
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
      Failed
    </span>
  );
}

export function RecoveryStatusBadge({ status }) {
  switch (status) {
    case 'Recovered':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Recovered
        </span>
      );
    case 'Pending Retry':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          Pending Retry
        </span>
      );
    case 'Link Dispatched':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          Link Sent
        </span>
      );
    case 'Callback Scheduled':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
          Callback Set
        </span>
      );
    case 'Human Escalated':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          Human Review
        </span>
      );
    case 'Opted Out':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          Opted Out (DNC)
        </span>
      );
    case 'Eligible':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
          Eligible
        </span>
      );
  }
}

export function FailureReasonBadge({ reason }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (reason === 'Insufficient Funds') {
    color = 'bg-orange-50 text-orange-800 border-orange-200';
  } else if (reason === 'Bank Declined') {
    color = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (reason === 'Mandate Inactive') {
    color = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (reason === 'Payment Timeout') {
    color = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (reason === 'Card Expired') {
    color = 'bg-gray-100 text-gray-700 border-gray-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
      {reason}
    </span>
  );
}

export function ConfidenceBadge({ score }) {
  const isHigh = score >= 90;
  const isMedium = score >= 75 && score < 90;

  if (isHigh) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {score}% High
      </span>
    );
  }
  if (isMedium) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        {score}% Confident
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
      {score}% Low (Review)
    </span>
  );
}
