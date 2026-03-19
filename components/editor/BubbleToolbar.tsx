import { useState, useRef, useEffect, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  Check,
} from 'lucide-react';
import { UrlInputDialog } from './UrlInputDialog';

interface BubbleToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, ariaLabel, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors ${
        isActive
          ? 'text-accent bg-[rgba(91,155,213,0.12)]'
          : 'text-text-primary hover:bg-surface-elevated'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      className="w-px h-4 mx-1"
      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
    />
  );
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  const closeHeading = useCallback(() => {
    setHeadingOpen(false);
  }, []);

  useEffect(() => {
    if (!headingOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (headingRef.current && !headingRef.current.contains(e.target as Node)) {
        closeHeading();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [headingOpen, closeHeading]);

  const handleLink = () => {
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = (url: string) => {
    editor.chain().focus().toggleLink({ href: url }).run();
    setLinkDialogOpen(false);
  };

  const activeHeadingLevel = editor.isActive('heading', { level: 1 })
    ? 1
    : editor.isActive('heading', { level: 2 })
      ? 2
      : editor.isActive('heading', { level: 3 })
        ? 3
        : 0;

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: ed, state }) => {
          const { from, to } = state.selection;
          if (from === to) return false;
          if (ed.isActive('codeBlock')) return false;
          if (ed.isActive('image')) return false;
          return true;
        }}
        tippyOptions={{ duration: [150, 100], delay: [0, 100] }}
      >
        <div
          className="flex items-center gap-1 bg-surface border border-border-strong rounded-lg p-1 shadow-[0_4px_12px_rgba(0,0,0,0.40)] animate-[fadeScaleIn_150ms_ease-out]"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            ariaLabel="Toggle bold"
          >
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            ariaLabel="Toggle italic"
          >
            <Italic size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            ariaLabel="Toggle underline"
          >
            <Underline size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            ariaLabel="Toggle strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            ariaLabel="Toggle inline code"
          >
            <Code size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={handleLink}
            isActive={editor.isActive('link')}
            ariaLabel="Insert link"
          >
            <Link size={16} />
          </ToolbarButton>

          <Divider />

          <div className="relative" ref={headingRef}>
            <button
              type="button"
              onClick={() => setHeadingOpen((prev) => !prev)}
              aria-label="Change heading level"
              className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors ${
                activeHeadingLevel > 0
                  ? 'text-accent bg-[rgba(91,155,213,0.12)]'
                  : 'text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <span className="text-xs font-semibold">
                {activeHeadingLevel > 0 ? `H${activeHeadingLevel}` : 'H'}
              </span>
              <ChevronDown size={12} />
            </button>

            {headingOpen && (
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border-strong rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.40)] p-1 z-50">
                {([1, 2, 3] as const).map((level) => {
                  const HeadingIcon = level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3;
                  const isActive = editor.isActive('heading', { level });
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHeading({ level }).run();
                        closeHeading();
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        isActive
                          ? 'text-accent bg-[rgba(91,155,213,0.12)]'
                          : 'text-text-primary hover:bg-surface-elevated'
                      }`}
                    >
                      <HeadingIcon size={16} />
                      <span className="text-sm whitespace-nowrap">Heading {level}</span>
                      {isActive && <Check size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </BubbleMenu>

      <UrlInputDialog
        isOpen={linkDialogOpen}
        label="Enter URL"
        onSubmit={handleLinkSubmit}
        onCancel={() => setLinkDialogOpen(false)}
      />
    </>
  );
}
