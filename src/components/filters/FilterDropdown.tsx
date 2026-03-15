import { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = (value: string) => {
    if (multiSelect) {
      onChange(
        selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
      );
    } else {
      onChange([value]);
      setIsOpen(false);
    }
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="filter-dropdown-button btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {label}
        {selected.length > 0 ? (
          <span className="badge badge-primary badge-sm">{selected.length}</span>
        ) : null}
        <svg
          className="icon-sm"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9L1 4h10z" />
        </svg>
      </button>
      {isOpen ? (
        <div className="filter-dropdown-menu" role="menu">
          {options.map((option) => (
            <label
              key={option.value}
              className="filter-dropdown-item"
              role="menuitemcheckbox"
              aria-checked={selected.includes(option.value)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="visually-hidden"
              />
              <span className="filter-dropdown-checkbox">
                {selected.includes(option.value) ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10 3L4.5 8.5 2 6" />
                  </svg>
                ) : null}
              </span>
              <span className="filter-dropdown-label">{option.label}</span>
              <span className="filter-dropdown-count">{option.count}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
