import { useState, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (localValue !== value) {
      setIsDebouncing(true);
    }
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
      setIsDebouncing(false);
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && localValue) {
        const searchInput = document.getElementById('project-search');
        if (document.activeElement === searchInput) {
          e.preventDefault();
          handleClear();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [localValue]);

  return (
    <div className="search-input-wrapper">
      {isDebouncing ? (
        <svg
          className="search-input-icon search-input-spinner"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" strokeWidth="2" strokeDasharray="30 10" />
        </svg>
      ) : (
        <svg
          className="search-input-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
      )}
      <input
        type="search"
        id="project-search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="input search-input"
        aria-label="Search projects"
        aria-describedby="search-help"
        aria-controls="projects-grid"
      />
      {localValue ? (
        <button
          className="search-input-clear btn btn-ghost btn-icon btn-sm"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      ) : null}
      <p id="search-help" className="sr-only">
        Search by title, technology, or keyword. Press Escape to clear.
      </p>
    </div>
  );
}
