import { useToast } from '../../hooks/useToast';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-[16px] right-[16px] flex flex-col gap-[8px] z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          exiting={toast.exiting}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
