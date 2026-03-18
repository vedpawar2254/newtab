import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { SlashCommandMenu } from '../../../components/editor/SlashCommandMenu';
import type { SlashCommandMenuRef } from '../../../components/editor/SlashCommandMenu';
import { slashItems } from '../slash-items';
import type { SlashItem } from '../slash-items';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: ({ query }: { query: string }) => {
          return slashItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: ReturnType<typeof Extension.create>['editor'];
          range: { from: number; to: number };
          props: SlashItem;
        }) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        render: () => {
          let component: ReactRenderer<SlashCommandMenuRef> | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props: {
              editor: ReturnType<typeof Extension.create>['editor'];
              clientRect: (() => DOMRect | null) | null;
              items: SlashItem[];
              command: (item: SlashItem) => void;
            }) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items,
                  command: props.command,
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate: (props: {
              clientRect: (() => DOMRect | null) | null;
              items: SlashItem[];
              command: (item: SlashItem) => void;
            }) => {
              if (component) {
                component.updateProps({
                  items: props.items,
                  command: props.command,
                });
              }

              if (popup && popup[0] && props.clientRect) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              }
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                if (popup && popup[0]) {
                  popup[0].hide();
                }
                return true;
              }

              if (component?.ref) {
                return component.ref.onKeyDown(props);
              }

              return false;
            },

            onExit: () => {
              if (popup && popup[0]) {
                popup[0].destroy();
              }
              if (component) {
                component.destroy();
              }
              popup = null;
              component = null;
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
