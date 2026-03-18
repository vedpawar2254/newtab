import { Info, Check, AlertTriangle } from 'lucide-react';
import type { ToastVariant } from '../../hooks/useToast';

const iconMap: Record<ToastVariant, React.FC<{ size: number; className?: string }>> = {
  info: Info,
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
};

const iconColorMap: Record<ToastVariant, string> = {
  info: 'text-accent',
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
};

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
  exiting?: boolean;
}

export function Toast({ message, variant, onDismiss, exiting }: ToastProps) {
  const Icon = iconMap[variant];
  const iconColor = iconColorMap[variant];

  return (
    <div
      role="alert"
      className={`flex items-center gap-[8px] bg-surface border border-border-strong rounded-lg py-[12px] px-[16px] max-w-[320px] text-[12px] font-normal text-text-primary cursor-pointer ${
        exiting
          ? 'animate-[toast-exit_150ms_ease-in_forwards]'
          : 'animate-[toast-enter_200ms_ease-out]'
      }`}
      onClick={onDismiss}
    >
      <Icon size={16} className={`${iconColor} shrink-0`} />
      <span>{message}</span>
    </div>
  );
}
