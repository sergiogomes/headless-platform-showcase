import { useState, useRef, useEffect, useCallback } from 'react';

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

function getFocusables(container: HTMLDivElement | null): HTMLElement[] {
  if (!container) return [];
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="true"]');
  const items = container.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');
  const list: HTMLElement[] = [];
  if (trigger) list.push(trigger);
  items.forEach((el) => list.push(el));
  return list;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeAndFocusTrigger = useCallback(() => {
    setIsOpen(false);
    const trigger = dropdownRef.current?.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="true"]'
    );
    trigger?.focus();
  }, []);

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
    const menu = menuRef.current;
    const firstItem = menu?.querySelector<HTMLElement>('[role="menuitemcheckbox"]');
    if (firstItem) {
      firstItem.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndFocusTrigger();
        return;
      }

      const container = dropdownRef.current;
      if (!container?.contains(document.activeElement as Node)) return;

      const focusables = getFocusables(container);
      const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
      const triggerIndex = 0;
      const firstItemIndex = 1;
      const lastItemIndex = focusables.length - 1;

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          const next = e.shiftKey ? (currentIndex <= triggerIndex ? lastItemIndex : currentIndex - 1) : (currentIndex >= lastItemIndex ? triggerIndex : currentIndex + 1);
          focusables[next]?.focus();
          return;
        }
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex <= triggerIndex) {
            focusables[firstItemIndex]?.focus();
          } else if (currentIndex < lastItemIndex) {
            focusables[currentIndex + 1]?.focus();
          }
          return;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex <= firstItemIndex) {
            focusables[triggerIndex]?.focus();
          } else if (currentIndex > firstItemIndex) {
            focusables[currentIndex - 1]?.focus();
          }
          return;
        case 'Home':
          e.preventDefault();
          focusables[firstItemIndex]?.focus();
          return;
        case 'End':
          e.preventDefault();
          focusables[lastItemIndex]?.focus();
          return;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const target = e.target as HTMLElement;
          const item = target.closest('[role="menuitemcheckbox"]');
          if (item) {
            const value = (item as HTMLElement).getAttribute('data-value');
            if (value != null) handleToggleRef.current(value);
          }
          return;
        }
        default:
          break;
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAndFocusTrigger]);

  const handleToggle = useCallback(
    (value: string) => {
      const isSelected = selected.includes(value);
      let newSelected: string[];
      
      if (multiSelect) {
        newSelected = isSelected ? selected.filter((v) => v !== value) : [...selected, value];
        onChange(newSelected);
      } else {
        newSelected = [value];
        onChange(newSelected);
        setIsOpen(false);
      }

      const action = isSelected ? 'removed' : 'selected';
      const count = newSelected.length;
      const filterWord = count === 1 ? 'filter' : 'filters';
      setAnnouncement(`${value} ${action}. ${count} ${filterWord} active.`);
      
      setTimeout(() => setAnnouncement(''), 3000);
    },
    [multiSelect, selected, onChange]
  );

  const handleToggleRef = useRef(handleToggle);
  handleToggleRef.current = handleToggle;

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
        <div className="filter-dropdown-menu" role="menu" ref={menuRef}>
          {options.map((option) => (
            <label
              key={option.value}
              className="filter-dropdown-item"
              role="menuitemcheckbox"
              aria-checked={selected.includes(option.value)}
              tabIndex={-1}
              data-value={option.value}
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
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
