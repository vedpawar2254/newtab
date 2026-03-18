import { useState, useCallback, useEffect } from 'react';
import { Link2, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useLinksStore } from '../../lib/stores/links-store';

export function QuickLinks() {
  const links = useLinksStore((s) => s.links);
  const initialize = useLinksStore((s) => s.initialize);
  const addLink = useLinksStore((s) => s.addLink);
  const removeLink = useLinksStore((s) => s.removeLink);

  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [titleValue, setTitleValue] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAdd = useCallback(async () => {
    const url = urlValue.trim();
    if (!url) return;
    // Auto-prefix https if no protocol
    const fullUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    await addLink(titleValue.trim(), fullUrl);
    setUrlValue('');
    setTitleValue('');
    setAdding(false);
  }, [urlValue, titleValue, addLink]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      } else if (e.key === 'Escape') {
        setAdding(false);
        setUrlValue('');
        setTitleValue('');
      }
    },
    [handleAdd]
  );

  return (
    <div className="border-t border-border">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-[16px] py-[8px] text-[12px] font-normal uppercase tracking-[0.05em] text-text-secondary hover:text-text-primary transition-colors"
      >
        <div className="flex items-center gap-[6px]">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          LINKS
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAdding(true);
            setExpanded(true);
          }}
          className="w-[18px] h-[18px] flex items-center justify-center rounded-[4px] hover:bg-surface-elevated text-text-secondary hover:text-text-primary"
          aria-label="Add link"
        >
          <Plus size={12} />
        </button>
      </button>

      {expanded && (
        <div className="px-[8px] pb-[8px]">
          {/* Add form */}
          {adding && (
            <div className="flex flex-col gap-[4px] mb-[4px] p-[8px] bg-bg rounded-[4px]">
              <input
                autoFocus
                type="text"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="URL..."
                spellCheck={false}
                className="w-full bg-transparent text-[12px] text-text-primary placeholder:text-[rgba(255,255,255,0.30)] outline-none font-mono"
              />
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Label (optional)"
                spellCheck={false}
                className="w-full bg-transparent text-[12px] text-text-primary placeholder:text-[rgba(255,255,255,0.30)] outline-none font-mono"
              />
              <div className="flex justify-end gap-[4px] mt-[2px]">
                <button
                  onClick={() => { setAdding(false); setUrlValue(''); setTitleValue(''); }}
                  className="text-[11px] text-text-secondary hover:text-text-primary px-[6px] py-[2px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="text-[11px] text-accent hover:text-text-primary px-[6px] py-[2px]"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Links list */}
          {links.length === 0 && !adding && (
            <div className="px-[8px] py-[4px] text-[12px] text-text-secondary">
              No links saved yet
            </div>
          )}

          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-[6px] group px-[8px] py-[4px] rounded-[4px] hover:bg-surface-elevated transition-colors"
            >
              <Link2 size={12} className="text-text-secondary flex-shrink-0" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-[12px] text-text-primary hover:text-accent truncate transition-colors"
                title={link.url}
              >
                {link.title || link.url}
              </a>
              <button
                onClick={() => removeLink(link.id)}
                className="w-[16px] h-[16px] flex items-center justify-center opacity-0 group-hover:opacity-100 text-text-secondary hover:text-destructive transition-opacity flex-shrink-0"
                aria-label={`Remove ${link.title || link.url}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
