import React from 'react';
import { useRecovery } from '../../context/RecoveryContext';
import { SlideOver } from '../common/SlideOver';
import { ConfidenceBadge } from '../common/Badge';
import { AudioWaveform } from '../common/AudioWaveform';
import { 
  PhoneCall, 
  Sparkles, 
  AlertTriangle, 
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export function CallDetailPanel() {
  const { selectedCallId, setSelectedCallId, calls } = useRecovery();

  if (!selectedCallId) return null;

  const call = calls.find(c => c.id === selectedCallId);
  if (!call) return null;

  const isLowConfidence = call.aiConfidence < 75;

  return (
    <SlideOver
      isOpen={!!selectedCallId}
      onClose={() => setSelectedCallId(null)}
      title="AI Voice Call Log & Decision Trail"
      subtitle={`${call.id} • ${call.customerName} (${call.company})`}
      width="max-w-[620px]"
    >
      {/* Audio Waveform Player */}
      <AudioWaveform duration={call.duration} />

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 text-xs">
        <div className="p-4.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1">
          <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">AI Confidence Score</span>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xl font-extrabold text-[#17243A] font-mono">{call.aiConfidence}%</span>
            <ConfidenceBadge score={call.aiConfidence} />
          </div>
        </div>

        <div className="p-4.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1">
          <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Customer Intent</span>
          <div className="pt-1 font-mono font-bold text-[#17243A] text-xs truncate">
            {call.intent}
          </div>
        </div>
      </div>

      {/* Safety Notice if Low Confidence */}
      {isLowConfidence && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5 text-xs text-amber-900 leading-relaxed shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-1">Safety Handoff Triggered</span>
            AI confidence score ({call.aiConfidence}%) fell below the 75% accuracy threshold. The decision engine automatically routed this customer to a senior human agent to prevent dispute escalation.
          </div>
        </div>
      )}

      {/* Call Metadata: Vertically Stacked Information Blocks */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Call Specifications & Outcome
        </h4>
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Call Timestamp & Duration
            </span>
            <div className="text-sm font-mono font-medium text-[#17243A]">
              {call.timestamp} • Duration: {call.duration}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Detected Failure Reason
            </span>
            <div className="text-sm font-semibold text-[#17243A]">
              {call.failureReason}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Dialogue Outcome
            </span>
            <div className="text-sm font-bold text-[#17243A]">
              {call.outcome}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Final Decision Engine Action
            </span>
            <div className="inline-block font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 text-xs">
              {call.finalAction}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Transcript: Spacious Chat Bubbles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Verbatim Speech-to-Text Transcript
          </h4>
          <span className="text-xs text-slate-400 font-medium">Recorded Audio Stream</span>
        </div>

        <div className="space-y-4 bg-slate-50/80 p-5 rounded-xl border border-slate-200/90 text-xs">
          {call.transcript && call.transcript.length > 0 ? (
            call.transcript.map((msg, idx) => {
              const isAi = msg.speaker === 'AI';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                    isAi ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {isAi ? 'AI' : 'C'}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4.5 py-3.5 leading-relaxed text-xs sm:text-[13px] ${
                    isAi 
                      ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs' 
                      : 'bg-blue-600 text-white shadow-2xs'
                  }`}>
                    <span className={`block font-bold text-[11px] mb-1.5 ${isAi ? 'text-blue-700' : 'text-blue-100'}`}>
                      {isAi ? 'RecoverAI Voice Agent (Aria)' : call.customerName}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-400 italic text-center py-4">No transcript recorded for this call.</p>
          )}
        </div>
      </div>

      {/* Backend Decision Engine Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-500" />
          Backend Decision Engine Execution Trail
        </h4>

        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs space-y-3 border border-slate-800">
          {call.decisionLog ? (
            call.decisionLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-blue-400 font-bold select-none shrink-0">[{log.step}]</span>
                <span className="text-slate-300 leading-relaxed">{log.result}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400">Validated customer intent and executed automated recovery pipeline.</div>
          )}
        </div>
      </div>
    </SlideOver>
  );
}
