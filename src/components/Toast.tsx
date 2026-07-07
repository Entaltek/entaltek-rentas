import { useCallback, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const pushToast = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  return { toasts, pushToast };
}

const TOAST_ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = TOAST_ICONS[toast.kind];
        return (
          <div key={toast.id} className={`toast toast-${toast.kind}`}>
            <Icon size={18} />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
