'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_KEYWORDS = 500;

export function KeywordInput({
  keywords,
  onChange,
  placeholder = 'Add another keyword... (Press Enter)',
  className,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = useCallback(
    (word: string) => {
      const trimmed = word.trim().toLowerCase();
      if (!trimmed || keywords.length >= MAX_KEYWORDS) return;
      if (keywords.includes(trimmed)) return;
      onChange([...keywords, trimmed]);
      setInputValue('');
    },
    [keywords, onChange],
  );

  const removeKeyword = useCallback(
    (index: number) => {
      onChange(keywords.filter((_, i) => i !== index));
    },
    [keywords, onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) addKeyword(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 min-h-[48px]',
        'focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-300',
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {keywords.map((kw, i) => (
        <span
          key={`${kw}-${i}`}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700"
        >
          {kw}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeKeyword(i);
            }}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label={`Remove ${kw}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      {keywords.length < MAX_KEYWORDS && (
        <span className="inline-flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
        </span>
      )}
      <span className="text-xs text-slate-400 ml-auto shrink-0 tabular-nums">
        {keywords.length}/{MAX_KEYWORDS} keywords
      </span>
    </div>
  );
}
