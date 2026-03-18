import { useState } from 'react';
import { getRandomQuote } from '../../lib/data/quotes';

export function QuoteFooter() {
  const [quote] = useState(() => getRandomQuote());

  return (
    <div className="border-t border-border px-[16px] py-[12px] animate-[fade-in_400ms_ease]">
      <p className="text-[14px] font-normal text-text-secondary italic">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-[12px] font-normal text-text-secondary/70 mt-[4px]">
        -- {quote.author}
      </p>
    </div>
  );
}
