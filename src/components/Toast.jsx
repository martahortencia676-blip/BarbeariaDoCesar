import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let toastId = 0;
let addToastFn = null;

export function toast(message, type = 'success') {
  if (addToastFn) addToastFn({ id: ++toastId, message, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (t) => setToasts(prev => [...prev, t]);
    return () => { addToastFn = null; };
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const bg = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    info: 'bg-blue-50 border-blue-300',
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-3 rounded-xl border shadow-lg animate-slide-in ${bg[t.type] || bg.success}`}>
      {icons[t.type] || icons.success}
      <p className="text-sm font-bold text-black flex-1">{t.message}</p>
      <button onClick={onClose} className="text-zinc-400 hover:text-black shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
