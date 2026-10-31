import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCafe();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#8C6D58] shrink-0" />,
        };

        const bgStyles = {
          success: 'bg-[#F4F9F5] border-emerald-200 text-emerald-950',
          warning: 'bg-[#FFFBF2] border-amber-200 text-amber-950',
          error: 'bg-[#FFF5F5] border-rose-200 text-rose-950',
          info: 'bg-[#FAF6F0] border-[#E5DACD] text-[#332219]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-md transition-all duration-200 ${bgStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#5C4D43] mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8C7A6E] hover:text-[#2C1810] transition-colors p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
