import React from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  AlertCircle, 
  DollarSign, 
  CheckCircle2, 
  Percent, 
  ArrowUpRight, 
  Megaphone, 
  PhoneCall, 
  Play, 
  ShieldCheck, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { PaymentStatusBadge, RecoveryStatusBadge, FailureReasonBadge } from '../common/Badge';
import { RECOVERY_PERFORMANCE_HISTORY } from '../../data/mockData';

export function OverviewView({ onNavigateTab }) {
  const { 
    kpis, 
    outcomeBreakdown, 
    customers, 
    setSelectedCustomerId, 
    setIsCreateCampaignOpen,
    setIsSimulatorOpen,
    setSimulatorTargetCustomerId
  } = useRecovery();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#17243A] text-white p-3.5 rounded-xl shadow-flyout text-xs font-sans space-y-2 border border-slate-700">
          <p className="font-bold text-slate-200">{label}</p>
          <div className="flex items-center justify-between gap-6">
            <span className="text-emerald-400 font-medium">Verified Recovered:</span>
            <span className="font-mono font-bold">₹{payload[0].value.toLocaleString('en-IN')}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Total at Risk:</span>
              <span className="font-mono font-medium">₹{payload[1].value.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="space-y-7 max-w-7xl mx-auto min-w-0">
      {/* Top Welcome Header with Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243A] tracking-tight">
            Recovery Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor failed autopay recurring payments and AI-powered voice recovery activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="h-10 inline-flex items-center gap-2 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setIsCreateCampaignOpen(true)}
            className="h-10 inline-flex items-center gap-2 px-4.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Start Recovery Campaign</span>
          </button>
        </div>
      </div>

      {/* 4 Spacious KPI Cards: min-h-[135px], 24px padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Failed Payments */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Failed Payments</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#17243A] tracking-tight font-sans">
              {kpis.failedCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Requires AI recovery outreach
            </p>
          </div>
        </div>

        {/* Card 2: Amount at Risk */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount at Risk</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#17243A] tracking-tight font-sans">
              ₹{kpis.amountAtRisk.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Eligible unrecovered payments
            </p>
          </div>
        </div>

        {/* Card 3: Amount Recovered */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Recovered</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight font-sans">
              ₹{kpis.amountRecovered.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Verified by Payment Simulator</span>
            </div>
          </div>
        </div>

        {/* Card 4: Recovery Rate */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovery Rate</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#17243A] tracking-tight font-sans">
              {kpis.recoveryRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>{kpis.recoveredCount} of {kpis.totalCount} accounts resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balanced Two-Column Section with min-w-0 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* LEFT COLUMN (7 cols): Clean Recovery Performance Chart */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#17243A] tracking-tight">
                Recovery Performance Over Time
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified successful recoveries vs. cohort volume (Past 7 Days)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                Recovered
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span>
                At Risk
              </span>
            </div>
          </div>

          <div className="w-full relative min-w-0" style={{ height: 288, minHeight: 288 }}>
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={RECOVERY_PERFORMANCE_HISTORY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="recoveredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="recovered" 
                  stroke="#10B981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#recoveredGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Compact Recovery Outcome Breakdown */}
        <div className="lg:col-span-5 min-w-0 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#17243A] tracking-tight">
                Recovery Outcome Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                10 Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Live status across the recovery decision engine
            </p>

            <div className="space-y-4">
              {outcomeBreakdown.map((item) => (
                <div key={item.name} className="text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-[#17243A] font-bold font-mono">
                      {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: item.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">TCPA & DNC Rules Enforced</span>
            <button 
              onClick={() => onNavigateTab('calls')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Call Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Recovery Activity Table: 76-84px min row height, min-w-[960px] */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/90 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17243A] tracking-tight">
              Recent Recovery Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest payment failure events and voice agent touchpoints
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all 10 customers</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[960px] border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-4.5 w-[26%]">Customer Information</th>
                <th className="px-6 py-4.5 w-[16%]">Amount & Due Date</th>
                <th className="px-6 py-4.5 w-[16%]">Failure Reason</th>
                <th className="px-6 py-4.5 w-[14%]">Payment Status</th>
                <th className="px-6 py-4.5 w-[14%]">Recovery Status</th>
                <th className="px-6 py-4.5 w-[14%] text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group h-[80px]"
                  onClick={() => setSelectedCustomerId(c.id)}
                >
                  {/* Customer Information: Vertically Grouped */}
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex flex-col justify-center gap-1">
                      <span className="font-semibold text-[#17243A] group-hover:text-blue-600 transition-colors text-sm leading-tight">
                        {c.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium leading-tight">
                        {c.company}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 leading-tight">
                        {c.invoiceId}
                      </span>
                    </div>
                  </td>

                  {/* Amount & Due Date */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <div className="flex flex-col justify-center gap-1">
                      <span className="font-mono font-bold text-[#17243A] text-[15px] leading-tight">
                        ₹{c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-400 leading-tight">
                        Due {c.dueDate}
                      </span>
                    </div>
                  </td>

                  {/* Failure Reason */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <FailureReasonBadge reason={c.failureReason} />
                  </td>

                  {/* Payment Status */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <PaymentStatusBadge status={c.paymentStatus} />
                  </td>

                  {/* Recovery Status */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <RecoveryStatusBadge status={c.recoveryStatus} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCustomerId(c.id)}
                        className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        Inspect
                      </button>
                      {c.paymentStatus !== 'Recovered' && !c.optedOut && (
                        <button
                          onClick={() => {
                            setSimulatorTargetCustomerId(c.id);
                            setIsSimulatorOpen(true);
                          }}
                          className="h-9 px-3.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Simulate</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
