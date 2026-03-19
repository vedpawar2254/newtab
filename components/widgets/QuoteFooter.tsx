import { useState, useRef, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { getRandomQuote, quotes as defaultQuotes } from '../../lib/data/quotes';
import { useQuoteStore } from '../../lib/stores/quote-store';

export function QuoteFooter() {
  const { customQuotes, addQuote, removeQuote } = useQuoteStore();
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Pick a random quote from combined pool
  const [quote] = useState(() => {
    const allQuotes = [...defaultQuotes, ...customQuotes];
    if (allQuotes.length === 0) return getRandomQuote();
    return allQuotes[Math.floor(Math.random() * allQuotes.length)];
  });

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  function handleAdd() {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    addQuote(trimmedText, author.trim() || 'Unknown');
    setText('');
    setAuthor('');
    setShowForm(false);
  }

  return (
    <div className="border-t border-border px-[16px] py-[12px] animate-[fade-in_400ms_ease]">
      <p className="text-[14px] font-normal text-text-secondary italic">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-[12px] font-normal text-text-secondary/70 mt-[4px]">
        -- {quote.author}
      </p>

      <div className="flex items-center gap-[6px] mt-[8px]">
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setShowManage(false); }}
          className="text-[11px] text-text-secondary hover:text-text-primary flex items-center gap-[4px] transition-colors duration-150"
        >
          <Plus size={12} />
          Add quote
        </button>
        {customQuotes.length > 0 && (
          <button
            type="button"
            onClick={() => { setShowManage(!showManage); setShowForm(false); }}
            className="text-[11px] text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Manage ({customQuotes.length})
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-[8px] flex flex-col gap-[6px]">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
            placeholder="Quote text..."
            className="bg-surface-elevated border border-border rounded-[4px] px-[8px] py-[4px] text-[12px] text-text-primary placeholder:text-text-secondary/50 outline-none"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
            placeholder="Author (optional)"
            className="bg-surface-elevated border border-border rounded-[4px] px-[8px] py-[4px] text-[12px] text-text-primary placeholder:text-text-secondary/50 outline-none"
          />
          <div className="flex gap-[4px]">
            <button
              type="button"
              onClick={handleAdd}
              className="text-[11px] px-[8px] py-[3px] rounded-[4px] bg-accent/20 text-accent hover:bg-accent/30 transition-colors duration-150"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[11px] px-[8px] py-[3px] rounded-[4px] text-text-secondary hover:bg-surface-elevated transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showManage && (
        <div className="mt-[8px] flex flex-col gap-[4px] max-h-[120px] overflow-y-auto">
          {customQuotes.map((q, i) => (
            <div key={i} className="flex items-start gap-[6px] group">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-secondary truncate">&ldquo;{q.text}&rdquo;</p>
                <p className="text-[10px] text-text-secondary/60">-- {q.author}</p>
              </div>
              <button
                type="button"
                onClick={() => removeQuote(i)}
                className="shrink-0 text-text-secondary hover:text-destructive transition-colors duration-150 mt-[2px]"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
