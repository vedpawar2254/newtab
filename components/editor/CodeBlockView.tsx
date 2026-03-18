import { useState, useCallback, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Copy, Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { value: null, label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

export function CodeBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLanguage = node.attrs.language;
  const languageLabel =
    LANGUAGES.find((l) => l.value === currentLanguage)?.label ?? 'Plain text';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(node.textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [node]);

  const handleSelectLanguage = useCallback(
    (value: string | null) => {
      updateAttributes({ language: value });
      setDropdownOpen(false);
    },
    [updateAttributes],
  );

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <NodeViewWrapper
      className="group relative my-2"
      style={{
        background: '#1E1E1E',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      {/* Top bar: copy button + language selector */}
      <div
        className="absolute top-2 right-2 flex flex-row items-center gap-2"
        style={{ zIndex: 10 }}
        contentEditable={false}
      >
        {/* Copy button - visible on hover */}
        <button
          type="button"
          aria-label="Copy code"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer"
          style={{
            padding: '4px',
            borderRadius: '4px',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#2F2F2F';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
          onClick={handleCopy}
        >
          {copied ? (
            <Check size={16} style={{ color: '#30A46C' }} />
          ) : (
            <Copy size={16} style={{ color: 'rgba(255, 255, 255, 0.50)' }} />
          )}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            className="flex items-center gap-1 cursor-pointer"
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.35)',
              background: 'transparent',
              border: 'none',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'color 100ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                'rgba(255, 255, 255, 0.60)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                'rgba(255, 255, 255, 0.35)';
            }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {languageLabel}
            <ChevronDown size={12} />
          </button>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: '#252525',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.40)',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 20,
                minWidth: '120px',
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.label}
                  type="button"
                  className="w-full text-left cursor-pointer"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    padding: '4px 8px',
                    color:
                      currentLanguage === lang.value
                        ? '#ECECEC'
                        : 'rgba(255, 255, 255, 0.50)',
                    background: 'transparent',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      '#2F2F2F';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                  }}
                  onClick={() => handleSelectLanguage(lang.value)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Code content */}
      <NodeViewContent
        as="pre"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      />
    </NodeViewWrapper>
  );
}
