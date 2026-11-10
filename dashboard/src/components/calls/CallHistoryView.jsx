import React, { useState } from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Play, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { ConfidenceBadge } from '../common/Badge';
import { CallDetailPanel } from './CallDetailPanel';

export function CallHistoryView() {
  const { calls, setSelectedCallId, setIsSimulatorOpen } = useRecovery();
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = calls.filter(call => {
    const matchesSearch = !searchQuery || (
      call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesOutcome = outcomeFilter === 'ALL' || call.outcome === outcomeFilter;

    return matchesSearch && matchesOutcome;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#17243A] tracking-tight">
            AI Voice Call History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete audit trail of AI voice dialogues, customer intent analysis, and confidence scores.
          </p>
        </div>

        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="h-10 inline-flex items-center gap-2 px-4.5 text-xs font-semibold text-white bg-[#17243A] hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Simulate New Call</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:px-6 sm:py-4.5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold mr-1">Outcome:</span>
          {['ALL', 'Retry requested', 'Payment link requested', 'Callback requested', 'Escalated to human', 'Declined'].map(outcome => (
            <button
              key={outcome}
              onClick={() => setOutcomeFilter(outcome)}
              className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                outcomeFilter === outcome
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {outcome === 'ALL' ? 'All Outcomes' : outcome}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search calls by customer, company..."
            className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Calls Table: 76-84px min row height, vertically centered */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[980px] border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-4.5 w-[25%]">Customer Information</th>
                <th className="px-6 py-4.5 w-[18%]">Call Timestamp & Duration</th>
                <th className="px-6 py-4.5 w-[20%]">Call Outcome</th>
                <th className="px-6 py-4.5 w-[15%]">AI Confidence</th>
                <th className="px-6 py-4.5 w-[11%]">Call Status</th>
                <th className="px-6 py-4.5 w-[11%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500 text-sm">
                    No voice calls found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group h-[80px]"
                  >
                    {/* Customer Information: Vertically Grouped */}
                    <td className="px-6 py-4.5 align-middle">
                      <div className="flex flex-col justify-center gap-1">
                        <span className="font-semibold text-[#17243A] group-hover:text-blue-600 transition-colors text-sm leading-tight">
                          {call.customerName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium leading-tight">
                          {call.company}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 leading-tight">
                          {call.id}
                        </span>
                      </div>
                    </td>

                    {/* Call Timestamp & Duration: Grouped */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <div className="flex flex-col justify-center gap-1">
                        <span className="font-mono text-slate-800 font-semibold text-xs leading-tight">
                          {call.timestamp}
                        </span>
                        <span className="text-xs text-slate-400 leading-tight">
                          Duration: <strong className="font-mono text-slate-600">{call.duration}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Outcome Badge */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        call.outcome === 'Retry requested'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : call.outcome === 'Payment link requested'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : call.outcome === 'Callback requested'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : call.outcome === 'Escalated to human'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {call.outcome}
                      </span>
                    </td>

                    {/* AI Confidence */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <ConfidenceBadge score={call.aiConfidence} />
                    </td>

                    {/* Call Status */}
                    <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        call.status === 'Completed'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : call.status === 'Escalated'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {call.status}
                      </span>
                    </td>

                    {/* Action Button: Transcript */}
                    <td className="px-6 py-4.5 align-middle text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCallId(call.id);
                        }}
                        className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                      >
                        <span>Transcript</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Call Detail Panel */}
      <CallDetailPanel />
    </div>
  );
}
