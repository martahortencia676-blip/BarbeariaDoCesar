import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Lock, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning' | 'danger' | 'info'
  requirePassword = false,
  passwordValue = '',
}) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setPasswordError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const colors = {
    warning: {
      icon: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      btn: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      btn: 'bg-red-600 hover:bg-red-700',
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const c = colors[type] || colors.warning;

  const handleConfirm = async () => {
    if (requirePassword) {
      if (!password) {
        setPasswordError('Digite a senha');
        return;
      }
      if (password !== passwordValue) {
        setPasswordError('Senha incorreta');
        return;
      }
    }
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header com ícone */}
        <div className={`flex items-center gap-4 p-6 pb-4`}>
          <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
            {type === 'danger' ? (
              <Trash2 className={`w-6 h-6 ${c.icon}`} />
            ) : (
              <AlertTriangle className={`w-6 h-6 ${c.icon}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-wider">{title}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4">
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">{message}</p>
        </div>

        {/* Password field */}
        {requirePassword && (
          <div className="px-6 pb-4">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Senha do proprietário
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                placeholder="Digite a senha de César"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-xl text-sm font-bold focus:border-zinc-800 outline-none transition-colors"
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs font-bold mt-2">{passwordError}</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${c.btn}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Alert modal for validation errors (replaces alert())
export function AlertModal({ open, onClose, title = 'Atenção', message = '', type = 'warning' }) {
  if (!open) return null;

  const colors = {
    warning: { icon: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    danger: { icon: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    info: { icon: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  };
  const c = colors[type] || colors.warning;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 p-6 pb-4">
          <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
            <AlertTriangle className={`w-6 h-6 ${c.icon}`} />
          </div>
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-wider">{title}</h3>
        </div>
        <div className="px-6 pb-4">
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
