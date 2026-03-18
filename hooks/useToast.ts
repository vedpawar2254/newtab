import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import React from 'react';

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, variant: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    // Mark as exiting first for exit animation (150ms)
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 150);
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);

    // Auto-dismiss: 4000ms for info/success/warning, 6000ms for error
    const duration = variant === 'error' ? 6000 : 4000;
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
