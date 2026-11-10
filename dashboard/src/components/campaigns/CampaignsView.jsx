import React from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { 
  Megaphone, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowUpRight,
  Play,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CreateCampaignModal } from './CreateCampaignModal';

export function CampaignsView() {
  const { campaigns, setIsCreateCampaignOpen, setIsSimulatorOpen } = useRecovery();

  const totalEligible = campaigns.reduce((sum, c) => sum + c.eligibleCustomers, 0);
  const totalCalls = campaigns.reduce((sum, c) => sum + c.callsCompleted, 0);
  const totalRecoveries = campaigns.reduce((sum, c) => sum + c.successfulRecoveries, 0);
  const totalAmountRecovered = campaigns.reduce((sum, c) => sum + (c.amountRecovered || 0), 0);

  return (
    <div className="space-y-7 max-w-7xl mx-auto min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#17243A] tracking-tight">
            Recovery Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automate targeted AI voice outreach across segmented autopay failure cohorts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateCampaignOpen(true)}
          className="h-10 inline-flex items-center gap-2 px-4.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* 4 Campaign KPI Cards: min-h-[120px], 24px padding, clear vertical balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Campaigns */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[120px] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Campaigns
          </span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#17243A] font-sans tracking-tight">
              {campaigns.filter(c => c.status === 'Active').length}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              out of {campaigns.length} configured cohorts
            </p>
          </div>
        </div>

        {/* Card 2: Audience Ingested */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[120px] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Audience Ingested
          </span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#17243A] font-sans tracking-tight">
              {totalEligible}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              eligible customer accounts queued
            </p>
          </div>
        </div>

        {/* Card 3: Calls Completed */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[120px] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Calls Completed
          </span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#17243A] font-sans tracking-tight">
              {totalCalls}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              voice recovery dialogues placed
            </p>
          </div>
        </div>

        {/* Card 4: Campaign Revenue Recovered */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-subtle min-h-[120px] flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Campaign Revenue Recovered
          </span>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-700 font-sans tracking-tight">
              ₹{totalAmountRecovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
              <span>{totalRecoveries} verified recoveries</span>
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Table: 76-84px min row height, vertically centered */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/90 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17243A] tracking-tight">
              Configured Campaigns
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted voice recovery cohorts and ongoing execution progress
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {campaigns.length} campaigns active
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[960px] border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-4.5 w-[28%]">Campaign Name & ID</th>
                <th className="px-6 py-4.5 w-[16%]">Eligible Audience</th>
                <th className="px-6 py-4.5 w-[20%]">Calls & Progress</th>
                <th className="px-6 py-4.5 w-[15%]">Recoveries</th>
                <th className="px-6 py-4.5 w-[11%]">Status</th>
                <th className="px-6 py-4.5 w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors h-[80px]">
                  {/* Campaign Name & ID: Vertically Organized */}
                  <td className="px-6 py-4.5 align-middle">
                    <div className="flex flex-col justify-center gap-1">
                      <span className="font-semibold text-[#17243A] text-sm leading-tight">
                        {camp.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-2 leading-tight">
                        <span className="font-mono text-slate-600 font-semibold">{camp.id}</span>
                        <span className="text-slate-300">•</span>
                        <span>Voice: {camp.voiceTone}</span>
                      </span>
                    </div>
                  </td>

                  {/* Eligible Audience */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <div className="flex flex-col justify-center gap-0.5">
                      <span className="font-mono font-bold text-[#17243A] text-sm">
                        {camp.eligibleCustomers} accounts
                      </span>
                      <span className="text-xs text-slate-400">
                        Segment cohort
                      </span>
                    </div>
                  </td>

                  {/* Calls Completed & Progress Bar Aligned */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <div className="flex flex-col justify-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#17243A] text-sm">
                          {camp.callsCompleted} / {camp.eligibleCustomers}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({camp.eligibleCustomers > 0 ? Math.round((camp.callsCompleted / camp.eligibleCustomers) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${camp.eligibleCustomers > 0 ? (camp.callsCompleted / camp.eligibleCustomers) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Recoveries Count & Amount Grouped */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    <div className="flex flex-col justify-center gap-0.5">
                      <span className="font-bold text-[#17243A] text-sm">
                        {camp.successfulRecoveries} recovered
                      </span>
                      {camp.amountRecovered > 0 ? (
                        <span className="text-emerald-700 font-mono text-xs font-semibold">
                          ₹{camp.amountRecovered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          In progress
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badges with Sufficient Padding */}
                  <td className="px-6 py-4.5 align-middle whitespace-nowrap">
                    {camp.status === 'Active' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Completed
                      </span>
                    )}
                  </td>

                  {/* Test Call Button: Comfortably Sized */}
                  <td className="px-6 py-4.5 align-middle text-right whitespace-nowrap">
                    <button
                      onClick={() => setIsSimulatorOpen(true)}
                      className="h-9 px-3.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/90 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      <span>Test Call</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Creation Modal */}
      <CreateCampaignModal />
    </div>
  );
}
