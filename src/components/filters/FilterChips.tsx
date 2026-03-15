interface FilterChipsProps {
  searchQuery: string;
  selectedStacks: string[];
  selectedDomains: string[];
  selectedTags: string[];
  onRemoveSearch: () => void;
  onRemoveStack: (stack: string) => void;
  onRemoveDomain: (domain: string) => void;
  onRemoveTag: (tag: string) => void;
  onClearAll: () => void;
}

export default function FilterChips({
  searchQuery,
  selectedStacks,
  selectedDomains,
  selectedTags,
  onRemoveSearch,
  onRemoveStack,
  onRemoveDomain,
  onRemoveTag,
  onClearAll,
}: FilterChipsProps) {
  const hasAny =
    searchQuery ||
    selectedStacks.length > 0 ||
    selectedDomains.length > 0 ||
    selectedTags.length > 0;

  if (!hasAny) return null;

  return (
    <div className="filter-chips">
      {searchQuery ? (
        <span className="filter-chip">
          Search: {searchQuery}
          <button
            type="button"
            className="filter-chip-remove"
            onClick={onRemoveSearch}
            aria-label={`Remove search "${searchQuery}"`}
          >
            ×
          </button>
        </span>
      ) : null}
      {selectedStacks.map((stack) => (
        <span key={stack} className="filter-chip">
          {stack}
          <button
            type="button"
            className="filter-chip-remove"
            onClick={() => onRemoveStack(stack)}
            aria-label={`Remove stack ${stack}`}
          >
            ×
          </button>
        </span>
      ))}
      {selectedDomains.map((domain) => (
        <span key={domain} className="filter-chip">
          {domain}
          <button
            type="button"
            className="filter-chip-remove"
            onClick={() => onRemoveDomain(domain)}
            aria-label={`Remove domain ${domain}`}
          >
            ×
          </button>
        </span>
      ))}
      {selectedTags.map((tag) => (
        <span key={tag} className="filter-chip">
          {tag}
          <button
            type="button"
            className="filter-chip-remove"
            onClick={() => onRemoveTag(tag)}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
