import { useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ExternalLink } from 'lucide-react';

export function BookmarkCardView({ node, updateAttributes }: NodeViewProps) {
  const { url, title, description, image, favicon, loaded } = node.attrs;

  useEffect(() => {
    if (loaded || !url) return;

    chrome.runtime.sendMessage(
      { type: 'fetch-metadata', url },
      (response) => {
        if (response && !response.error) {
          updateAttributes({
            title: response.title || '',
            description: response.description || '',
            image: response.image || '',
            favicon: response.favicon || '',
            loaded: true,
          });
        } else {
          updateAttributes({ loaded: true });
        }
      },
    );
  }, [url, loaded, updateAttributes]);

  if (!loaded) {
    return (
      <NodeViewWrapper>
        <div className="bookmark-shimmer w-full rounded-lg" style={{ height: 80 }} />
      </NodeViewWrapper>
    );
  }

  if (!title && !description) {
    return (
      <NodeViewWrapper>
        <a
          href={url}
          className="text-accent underline-offset-2 hover:underline cursor-pointer"
          style={{ fontSize: 14 }}
          onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank');
          }}
          aria-label={`Open link: ${url}`}
        >
          <ExternalLink size={14} className="inline mr-1 align-text-bottom" />
          {url}
        </a>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        className="flex rounded-lg cursor-pointer transition-colors duration-150"
        style={{
          background: '#252525',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: 16,
        }}
        onClick={() => window.open(url, '_blank')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') window.open(url, '_blank');
        }}
        role="link"
        tabIndex={0}
        aria-label={`Open link: ${url}`}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            'rgba(255, 255, 255, 0.16)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            'rgba(255, 255, 255, 0.08)';
        }}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <div
              className="font-semibold text-text-primary"
              style={{
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className="mt-1"
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.50)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {favicon && (
              <img
                src={favicon}
                alt=""
                width={14}
                height={14}
                className="flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.35)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {url}
            </span>
          </div>
        </div>
        {image && (
          <img
            src={image}
            alt=""
            className="flex-shrink-0 rounded ml-4"
            style={{ width: 80, height: 80, objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
