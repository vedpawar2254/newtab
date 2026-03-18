import { forwardRef, useImperativeHandle, useRef } from 'react';
import { SlashCommandList } from './SlashCommandList';
import type { SlashCommandListRef } from './SlashCommandList';
import type { SlashItem } from '../../lib/editor/slash-items';

interface SlashCommandMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const listRef = useRef<SlashCommandListRef>(null);

    useImperativeHandle(ref, () => ({
      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (listRef.current) {
          return listRef.current.onKeyDown(props);
        }
        return false;
      },
    }));

    return <SlashCommandList ref={listRef} items={items} command={command} />;
  },
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
