import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { SlashItem } from '../../lib/editor/slash-items';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Image,
  Code,
  Table,
  Link,
  Quote,
  Minus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SlashCommandListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Image,
  Code,
  Table,
  Link,
  Quote,
  Minus,
};

function getIcon(iconName: string): LucideIcon | null {
  return iconMap[iconName] || null;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useEffect(() => {
      const el = itemRefs.current.get(selectedIndex);
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        if (event.key === 'Escape') {
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div
          className="w-[280px] max-h-[320px] bg-surface border border-border-strong rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.50)] p-4 animate-[slashEnter_120ms_ease-out]"
        >
          <p className="text-center text-xs text-text-secondary">
            No match found -- press Esc to close
          </p>
        </div>
      );
    }

    // Group items by category
    const categories: { name: string; items: { item: SlashItem; globalIndex: number }[] }[] = [];
    const categoryMap = new Map<string, { item: SlashItem; globalIndex: number }[]>();

    items.forEach((item, index) => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push({ item, globalIndex: index });
    });

    for (const [name, catItems] of categoryMap) {
      categories.push({ name, items: catItems });
    }

    return (
      <div
        ref={listRef}
        className="w-[280px] max-h-[320px] overflow-y-auto bg-surface border border-border-strong rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.50)] p-2 animate-[slashEnter_120ms_ease-out]"
      >
        {categories.map((category) => (
          <div key={category.name}>
            <div
              className="text-xs uppercase tracking-[0.05em] px-2 py-1"
              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
            >
              {category.name}
            </div>
            {category.items.map(({ item, globalIndex }) => {
              const IconComp = getIcon(item.icon);
              const isSelected = globalIndex === selectedIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  ref={(el) => {
                    if (el) {
                      itemRefs.current.set(globalIndex, el);
                    } else {
                      itemRefs.current.delete(globalIndex);
                    }
                  }}
                  onClick={() => selectItem(globalIndex)}
                  className={`w-full flex items-center gap-3 h-9 px-2 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[rgba(91,155,213,0.12)]'
                      : 'hover:bg-[rgba(91,155,213,0.12)]'
                  }`}
                >
                  {IconComp && (
                    <IconComp
                      size={18}
                      className="flex-shrink-0"
                      style={{ color: 'rgba(255, 255, 255, 0.50)' }}
                    />
                  )}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm text-text-primary">{item.title}</span>
                    {item.description && (
                      <span
                        className="text-xs truncate"
                        style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                      >
                        {item.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);

SlashCommandList.displayName = 'SlashCommandList';
