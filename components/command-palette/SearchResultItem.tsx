import { Command } from 'cmdk';
import { FileText } from 'lucide-react';

interface SearchResultItemProps {
  title: string;
  snippet: string;
  query: string;
  onSelect: () => void;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-search-highlight text-accent rounded-[2px] px-[2px]">{match}</mark>
      {after}
    </>
  );
}

export function SearchResultItem({ title, snippet, query, onSelect }: SearchResultItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex flex-col min-h-[48px] px-[8px] py-[4px] rounded-[6px] cursor-pointer transition-colors duration-100 ease-linear hover:bg-surface-elevated data-[selected=true]:bg-active-item-bg data-[selected=true]:border-l-2 data-[selected=true]:border-l-accent"
    >
      <div className="flex items-center gap-[8px]">
        <FileText size={16} className="text-text-secondary shrink-0" />
        <span className="text-[14px] text-text-primary truncate">{title || 'Untitled'}</span>
      </div>
      {snippet && (
        <span className="text-[12px] text-text-secondary truncate pl-[24px]">
          {highlightMatch(snippet, query)}
        </span>
      )}
    </Command.Item>
  );
}
