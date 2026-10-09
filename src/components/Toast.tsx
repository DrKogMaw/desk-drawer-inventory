import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0" />,
  };

  const toastStyles = {
    success: 'border-emerald-300 dark:border-emerald-500/40 bg-white/95 text-emerald-900 dark:bg-slate-900/90 dark:text-emerald-200 shadow-emerald-500/10',
    warning: 'border-amber-300 dark:border-amber-500/40 bg-white/95 text-amber-900 dark:bg-slate-900/90 dark:text-amber-200 shadow-amber-500/10',
    info: 'border-brand-300 dark:border-brand-500/40 bg-white/95 text-brand-900 dark:bg-slate-900/90 dark:text-brand-200 shadow-brand-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${
          toastStyles[toast.type]
        }`}
      >
        {icons[toast.type]}
        <span>{toast.message}</span>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
