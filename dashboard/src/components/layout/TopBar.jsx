import React, { useState } from 'react';
import { Search, Bell, Menu, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useRecovery } from '../../context/RecoveryContext';

export function TopBar({ activeTab, onMobileToggle }) {
  const { searchQuery, setSearchQuery, notifications, markAllNotificationsRead } = useRecovery();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabTitles = {
    overview: 'Overview',
    customers: 'Customers',
    campaigns: 'Recovery Campaigns',
    calls: 'Call History',
    analytics: 'Analytics',
    settings: 'Settings'
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/90 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 min-w-0">
      <div className="flex items-center gap-3.5 shrink-0">
        <button
          onClick={onMobileToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Workspace</span>
          <h1 className="text-base sm:text-lg font-bold text-[#17243A] tracking-tight -mt-0.5">
            {tabTitles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search Field with collision prevention */}
        <div className="relative hidden md:block w-52 lg:w-68">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers, invoices..."
            className="w-full h-9.5 pl-9 pr-8 text-xs sm:text-sm bg-[#F1F4F8]/70 border border-slate-200 rounded-lg text-[#17243A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9.5 h-9.5 rounded-lg border border-slate-200/90 text-slate-600 hover:text-[#17243A] hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2.5 w-84 bg-white rounded-xl shadow-flyout border border-slate-200 p-4 z-40">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#17243A] uppercase tracking-wider">Recovery Audit Events</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="py-3 px-1 flex items-start gap-3">
                      {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                      <div className="text-xs">
                        <div className="font-semibold text-[#17243A] flex items-center justify-between gap-2">
                          <span>{notif.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed font-medium">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile / Demo Merchant with shrink-0 protection */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#17243A] text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-2xs">
            AC
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-[#17243A] block leading-tight">Acme Cloud India</span>
            <span className="text-[11px] text-slate-400 block font-medium">Stripe Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
}
