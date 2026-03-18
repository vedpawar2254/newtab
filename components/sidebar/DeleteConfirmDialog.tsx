import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageName: string;
  childCount: number;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  pageName,
  childCount,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#252525] border border-border-strong rounded-[8px] p-[24px] max-w-[400px] w-full data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150">
          <AlertDialog.Title className="text-[20px] font-semibold text-text-primary leading-[1.2]">
            Delete page?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-[14px] font-normal text-text-secondary leading-[1.5] mt-[8px]">
            This will permanently delete &quot;{pageName}&quot; and {childCount}{' '}
            child {childCount === 1 ? 'page' : 'pages'}. This cannot be undone.
          </AlertDialog.Description>
          <div className="flex gap-[8px] justify-end mt-[24px]">
            <AlertDialog.Cancel asChild>
              <button className="text-[14px] font-normal text-text-primary bg-transparent border border-border-strong px-[16px] py-[8px] rounded-[4px] hover:bg-surface-elevated cursor-pointer">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                className="text-[14px] font-semibold text-white bg-[#E5484D] px-[16px] py-[8px] rounded-[4px] hover:bg-[#D13438] cursor-pointer"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
