import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

let toastCallback = null;

export const toast = {
  show: (message, type = 'success') => {
    if (toastCallback) {
      toastCallback(message, type);
    }
  },
  success: (message) => toast.show(message, 'success'),
  error: (message) => toast.show(message, 'error'),
  warning: (message) => toast.show(message, 'warning'),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastCallback = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      toastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-card flex items-center justify-between p-4 rounded-xl border border-white/10 shadow-lg relative overflow-hidden"
          >
            {/* Left accent color */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${
              t.type === 'success' ? 'bg-brand-emerald' : t.type === 'error' ? 'bg-brand-rose' : 'bg-brand-amber'
            }`} />

            <div className="flex items-center gap-3 ml-2">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-brand-emerald shrink-0" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-brand-rose shrink-0" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0" />}
              <span className="text-slate-200 text-xs font-semibold">{t.message}</span>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors ml-4 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default toast;
