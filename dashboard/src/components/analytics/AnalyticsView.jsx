import React from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  TrendingUp,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export function AnalyticsView() {
  const { kpis, outcomeBreakdown, customers } = useRecovery();

  const retrySuccessRate = '85.7%';

  // Full breakdown of all 5 realistic failure reasons per requirements
  const failureReasonData = [
    { 
      name: 'Insufficient Funds', 
      total: customers.filter(c => c.failureReason === 'Insufficient Funds').length, 
      recovered: customers.filter(c => c.failureReason === 'Insufficient Funds' && c.paymentStatus === 'Recovered').length 
    },
    { 
      name: 'Bank Declined', 
      total: customers.filter(c => c.failureReason === 'Bank Declined').length, 
      recovered: customers.filter(c => c.failureReason === 'Bank Declined' && c.paymentStatus === 'Recovered').length 
    },
    { 
      name: 'Mandate Inactive', 
      total: customers.filter(c => c.failureReason === 'Mandate Inactive').length, 
      recovered: customers.filter(c => c.failureReason === 'Mandate Inactive' && c.paymentStatus === 'Recovered').length 
    },
    { 
      name: 'Payment Timeout', 
      total: customers.filter(c => c.failureReason === 'Payment Timeout').length, 
      recovered: customers.filter(c => c.failureReason === 'Payment Timeout' && c.paymentStatus === 'Recovered').length 
    },
    { 
      name: 'Card Expired', 
      total: customers.filter(c => c.failureReason === 'Card Expired').length, 
      recovered: customers.filter(c => c.failureReason === 'Card Expired' && c.paymentStatus === 'Recovered').length 
    },
  ];

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#17243A] text-white p-3.5 rounded-xl shadow-flyout text-xs font-sans space-y-2 border border-slate-700">
          <p className="font-bold text-slate-200">{label}</p>
          <div className="flex items-center justify-between gap-5 text-slate-300">
            <span>Total Failed:</span>
            <span className="font-mono font-bold text-white">{payload[0]?.value} accounts</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-5 text-emerald-400 font-medium">
              <span>Verified Recovered:</span>
              <span className="font-mono font-bold text-white">{payload[1]?.value} accounts</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto min-w-0">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17243A] tracking-tight">
          Recovery Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Actionable metrics tracking AI recovery efficacy, retry success rates, and failure categories.
        </p>
      </div>

      {/* 3 Core Metric Cards: min-h-[135px], 24px padding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Overall Recovery Rate */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Recovery Rate</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#17243A] tracking-tight font-sans">{kpis.recoveryRate}%</span>
            <div className="text-xs text-slate-500 mt-1.5 font-medium">
              {kpis.recoveredCount} of {kpis.totalCount} failed autopays recovered
            </div>
          </div>
        </div>

        {/* Metric 2: Total Verified Recovered */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Amount Successfully Recovered</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight font-sans">
              ₹{kpis.amountRecovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-xs text-emerald-700 mt-1.5 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>100% verified via payment gateway simulator</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Retry Success Rate */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[135px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Payment Simulator Retry Success</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#17243A] tracking-tight font-sans">{retrySuccessRate}</span>
            <div className="text-xs text-slate-500 mt-1.5 font-medium">
              When customer authorized instant retry
            </div>
          </div>
        </div>
      </div>

      {/* Two Balanced Meaningful Charts: min-w-0 on grid items to prevent Recharts collapse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Chart 1: Failure Reason Distribution (lg:col-span-7) */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#17243A] tracking-tight">
                Failure Reason Distribution & Recovery
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total failures vs verified recoveries across all failure categories
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300"></span> Total Failed
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Verified Recovered
              </span>
            </div>
          </div>

          {/* Guaranteed non-zero container height for Recharts */}
          <div className="w-full relative min-w-0" style={{ height: 320, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={failureReasonData} 
                margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tickLine={false} 
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="total" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Total Failed" />
                <Bar dataKey="recovered" fill="#10B981" radius={[4, 4, 0, 0]} name="Verified Recovered" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Call Outcome Distribution (lg:col-span-5) */}
        <div className="lg:col-span-5 min-w-0 bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17243A] tracking-tight mb-1">
              Call Outcome Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Breakdown of customer decisions captured by AI voice agent
            </p>

            <div className="space-y-4">
              {outcomeBreakdown.map((item) => (
                <div key={item.name} className="text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-700 font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-[#17243A] font-mono">
                      {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="font-medium">Intent Classifier: v2.4</span>
            <span className="text-emerald-700 font-bold">94.2% Mean Confidence</span>
          </div>
        </div>
      </div>

      {/* Failure Reason Matrix Table: 76px min row height */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/90">
          <h3 className="text-base font-bold text-[#17243A] tracking-tight">
            Failure Code Performance Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated recovery protocols and turnaround metrics by error specification
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-4.5 w-[24%]">Error Code</th>
                <th className="px-6 py-4.5 w-[20%]">Failure Category</th>
                <th className="px-6 py-4.5 w-[28%]">Recommended Policy</th>
                <th className="px-6 py-4.5 w-[14%]">Auto Retry Window</th>
                <th className="px-6 py-4.5 w-[14%] text-right">Avg Recovery Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/70 transition-colors h-[76px]">
                <td className="px-6 py-4.5 font-mono font-bold text-[#17243A] whitespace-nowrap align-middle">
                  ERR_INSUFFICIENT_FUNDS
                </td>
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap align-middle">
                  Insufficient Funds
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-medium align-middle">
                  Voice call + scheduled payroll aligned retry
                </td>
                <td className="px-6 py-4.5 font-mono font-medium whitespace-nowrap align-middle">
                  48-72 Hours
                </td>
                <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold whitespace-nowrap align-middle">
                  2.1 Days
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors h-[76px]">
                <td className="px-6 py-4.5 font-mono font-bold text-[#17243A] whitespace-nowrap align-middle">
                  ERR_DO_NOT_HONOR
                </td>
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap align-middle">
                  Bank Declined
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-medium align-middle">
                  Voice alert + tokenized payment link
                </td>
                <td className="px-6 py-4.5 font-mono font-medium whitespace-nowrap align-middle">
                  Instant Link
                </td>
                <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold whitespace-nowrap align-middle">
                  1.4 Days
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors h-[76px]">
                <td className="px-6 py-4.5 font-mono font-bold text-[#17243A] whitespace-nowrap align-middle">
                  ERR_MANDATE_EXPIRED
                </td>
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap align-middle">
                  Mandate Inactive
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-medium align-middle">
                  Re-authorization portal dispatch
                </td>
                <td className="px-6 py-4.5 font-mono font-medium whitespace-nowrap align-middle">
                  On Confirmation
                </td>
                <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold whitespace-nowrap align-middle">
                  3.0 Days
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors h-[76px]">
                <td className="px-6 py-4.5 font-mono font-bold text-[#17243A] whitespace-nowrap align-middle">
                  ERR_GATEWAY_TIMEOUT
                </td>
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap align-middle">
                  Payment Timeout
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-medium align-middle">
                  Automated idempotency check & rapid retry
                </td>
                <td className="px-6 py-4.5 font-mono font-medium whitespace-nowrap align-middle">
                  15-60 Minutes
                </td>
                <td className="px-6 py-4.5 text-right font-mono text-emerald-700 font-bold whitespace-nowrap align-middle">
                  0.2 Days
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors h-[76px]">
                <td className="px-6 py-4.5 font-mono font-bold text-[#17243A] whitespace-nowrap align-middle">
                  ERR_CARD_EXPIRED
                </td>
                <td className="px-6 py-4.5 font-semibold text-slate-800 whitespace-nowrap align-middle">
                  Card Expired
                </td>
                <td className="px-6 py-4.5 text-slate-600 font-medium align-middle">
                  Immediate payment method update SMS link
                </td>
                <td className="px-6 py-4.5 font-mono font-medium whitespace-nowrap align-middle">
                  24 Hours
                </td>
                <td className="px-6 py-4.5 text-right font-mono text-slate-500 font-medium whitespace-nowrap align-middle">
                  N/A (Opted Out)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
