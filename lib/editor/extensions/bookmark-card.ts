import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BookmarkCardView } from '../../../components/editor/BookmarkCardView';

export interface BookmarkCardAttributes {
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  loaded: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bookmarkCard: {
      setBookmarkCard: (attrs: { url: string }) => ReturnType;
    };
  }
}

export const BookmarkCard = Node.create({
  name: 'bookmarkCard',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      image: { default: '' },
      favicon: { default: '' },
      loaded: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-bookmark-card]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-bookmark-card': '' }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkCardView);
  },

  addCommands() {
    return {
      setBookmarkCard:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
