import { FileText } from 'lucide-react';
import { useUIStore } from '../../lib/stores/ui-store';

interface MainContentProps {
  children?: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const isLoading = useUIStore((s) => s.isLoading);

  return (
    <main className="flex-1 bg-bg pt-[48px] px-[32px] min-h-screen">
      <div className="max-w-[720px] mx-auto">
        {isLoading ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center gap-[16px] min-h-[60vh]">
            <FileText
              size={48}
              style={{ color: 'rgba(255, 255, 255, 0.15)' }}
            />
            <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.01em]">
              Start writing
            </h1>
            <p className="text-[14px] text-text-secondary text-center">
              Create your first page to begin. Your notes stay on this device,
              always private.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
