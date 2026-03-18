import { Command } from 'cmdk';
import type { LucideIcon } from 'lucide-react';

interface CommandPaletteItemProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}

export function CommandPaletteItem({ icon: Icon, label, shortcut, onSelect }: CommandPaletteItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center h-[40px] px-[8px] rounded-[6px] gap-[8px] cursor-pointer transition-colors duration-100 ease-linear hover:bg-surface-elevated data-[selected=true]:bg-active-item-bg data-[selected=true]:border-l-2 data-[selected=true]:border-l-accent"
    >
      <Icon size={16} className="text-text-secondary shrink-0" />
      <span className="text-[14px] text-text-primary flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="bg-shortcut-badge rounded-[4px] px-[6px] py-[2px] text-[12px] text-text-secondary font-mono">
          {shortcut}
        </span>
      )}
    </Command.Item>
  );
}
