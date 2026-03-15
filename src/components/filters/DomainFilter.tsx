import FilterDropdown, { type FilterOption } from './FilterDropdown';

interface DomainFilterProps {
  domains: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  projectCountByDomain: Record<string, number>;
}

export default function DomainFilter({
  domains,
  selected,
  onChange,
  projectCountByDomain,
}: DomainFilterProps) {
  const options: FilterOption[] = domains.map((domain) => ({
    value: domain,
    label: domain,
    count: projectCountByDomain[domain] ?? 0,
  }));

  return (
    <FilterDropdown
      label="Domain"
      options={options}
      selected={selected}
      onChange={onChange}
      multiSelect={true}
    />
  );
}
