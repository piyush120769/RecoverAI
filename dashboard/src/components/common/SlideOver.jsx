import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function SlideOver({ isOpen, onClose, title, subtitle, children, width = 'max-w-[620px]' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Subtle backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className={`w-screen ${width} bg-white shadow-2xl border-l border-slate-200/90 flex flex-col transform transition-all duration-300 ease-in-out`}>
          {/* Drawer Header: spacious and clean */}
          <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[#17243A] tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-1 font-mono">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-4"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: vertically scrollable with generous padding */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
