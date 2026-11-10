import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  PhoneCall, 
  BarChart3, 
  Settings,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useRecovery } from '../../context/RecoveryContext';

export function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) {
  const { kpis, setIsSimulatorOpen } = useRecovery();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: kpis.failedCount },
    { id: 'campaigns', label: 'Recovery Campaigns', icon: Megaphone },
    { id: 'calls', label: 'Call History', icon: PhoneCall },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40
        w-64 bg-white border-r border-slate-200/90
        flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top brand */}
        <div>
          <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin-slow"></div>
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">RecoverAI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Fintech
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5 font-medium">Autopay Recovery Engine</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3.5 space-y-1.5">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full h-11 flex items-center justify-between px-3.5 rounded-lg text-sm font-medium transition-all group
                    ${isActive 
                      ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full tabular-nums ${
                      isActive ? 'bg-blue-200/80 text-blue-800' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/70'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility / Live test CTA */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/40">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="w-full h-10 flex items-center justify-center gap-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span>Test Voice Simulator</span>
          </button>

          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Decision Engine
            </span>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold tracking-wide">ONLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
