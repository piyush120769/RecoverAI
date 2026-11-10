import React, { useState, useMemo } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  Search, 
  Filter, 
  PhoneCall, 
  RefreshCw, 
  ShieldCheck, 
  Ban,
  ChevronDown
} from 'lucide-react';
import { PaymentStatusBadge, RecoveryStatusBadge, FailureReasonBadge } from '../common/Badge';

export function CustomersView() {
  const { 
    customers, 
    searchQuery, 
    setSearchQuery, 
    setSelectedCustomerId, 
    setIsSimulatorOpen, 
    setSimulatorTargetCustomerId,
    executePaymentSimulator 
  } = useRecovery();

  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [retryingId, setRetryingId] = useState(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = !searchQuery || (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesReason = reasonFilter === 'ALL' || c.failureReason === reasonFilter;

      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'Recovered' && c.paymentStatus === 'Recovered') ||
        (statusFilter === 'Failed' && c.paymentStatus === 'Failed' && !c.optedOut) ||
        (statusFilter === 'Opted Out' && c.optedOut);

      return matchesSearch && matchesReason && matchesStatus;
    });
  }, [customers, searchQuery, reasonFilter, statusFilter]);

  const handleSimulateRetry = async (e, customerId) => {
    e.stopPropagation();
    setRetryingId(customerId);
    await executePaymentSimulator(customerId);
    setRetryingId(null);
  };

  const handleLaunchCall = (e, customerId) => {
    e.stopPropagation();
    setSimulatorTargetCustomerId(customerId);
    setIsSimulatorOpen(true);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto min-w-0">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#17243A] tracking-tight">
            Customer Recovery Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            10 customer accounts currently requiring recovery management or verification.
          </p>
        </div>

        {/* Quick summary counters */}
        <div className="flex items-center gap-2 text-xs font-semibold shrink-0 flex-wrap">
          <span className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            Total: 10
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            Failed: {customers.filter(c => c.paymentStatus === 'Failed' && !c.optedOut).length}
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            Recovered: {customers.filter(c => c.paymentStatus === 'Recovered').length}
          </span>
          <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
            DNC: {customers.filter(c => c.optedOut).length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:px-6 sm:py-4.5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 flex-1 min-w-0">
          {/* Reason Filter */}
          <div className="flex items-center gap-2 text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">Reason:</span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Failure Reasons</option>
              <option value="Insufficient Funds">Insufficient Funds</option>
              <option value="Bank Declined">Bank Declined</option>
              <option value="Mandate Inactive">Mandate Inactive</option>
              <option value="Payment Timeout">Payment Timeout</option>
              <option value="Card Expired">Card Expired</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-slate-600 shrink-0">
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Failed">Failed / Active Outreach</option>
              <option value="Recovered">Verified Recovered</option>
              <option value="Opted Out">Opted Out (DNC)</option>
            </select>
          </div>
        </div>

        {/* Local Table Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, invoice..."
            className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Customers Table: Structured with min-w-[1040px], 76-84px row heights, vertically centered */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[1040px] border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-4.5 w-[25%]">Customer Information</th>
                <th className="px-6 py-4.5 w-[15%]">Amount & Due Date</th>
                <th className="px-6 py-4.5 w-[16%]">Failure Reason</th>
                <th className="px-6 py-4.5 w-[14%]">Payment Status</th>
                <th className="px-6 py-4.5 w-[14%]">Recovery Status</th>
                <th className="px-6 py-4.5 w-[16%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500 text-sm">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group h-[80px]"
                  >
                    {/* Customer Information Column: Vertically Grouped (Name, Company, Invoice ID) */}
                    <td className="px-6 py-4.5 align-middle">
                      <div className="flex flex-col justify-center gap-1">
                        <span className="font-semibold text-[#17243A] text-sm group-hover:text-blue-600 transition-colors leading-tight">
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

                    {/* Amount & Due Date Column: Amount clearly visible with Due Date below */}
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

                    {/* Failure Reason Column: Vertically centered status badge */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <FailureReasonBadge reason={c.failureReason} />
                    </td>

                    {/* Payment Status Column */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <PaymentStatusBadge status={c.paymentStatus} />
                    </td>

                    {/* Recovery Status Column: Status pill with adequate padding */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <RecoveryStatusBadge status={c.recoveryStatus} />
                    </td>

                    {/* Actions Column: Details, AI Call, and Retry horizontally aligned with consistent heights */}
                    <td className="px-6 py-4.5 align-middle text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCustomerId(c.id)}
                          className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          Details
                        </button>

                        {c.paymentStatus !== 'Recovered' && !c.optedOut ? (
                          <>
                            <button
                              onClick={(e) => handleLaunchCall(e, c.id)}
                              title="Place AI Voice Call"
                              className="h-9 px-3.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>AI Call</span>
                            </button>
                            <button
                              disabled={retryingId === c.id}
                              onClick={(e) => handleSimulateRetry(e, c.id)}
                              title="Simulate direct bank retry"
                              className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${retryingId === c.id ? 'animate-spin text-emerald-600' : ''}`} />
                              <span>Retry</span>
                            </button>
                          </>
                        ) : c.optedOut ? (
                          <span className="text-xs text-slate-400 italic font-medium flex items-center gap-1.5 justify-end shrink-0 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                            <Ban className="w-3.5 h-3.5 text-slate-400" />
                            Suppressed
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 justify-end shrink-0 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Recovered
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
