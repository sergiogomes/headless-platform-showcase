import FilterDropdown, { type FilterOption } from './FilterDropdown';

interface StackFilterProps {
  stacks: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  projectCountByStack: Record<string, number>;
}

export default function StackFilter({
  stacks,
  selected,
  onChange,
  projectCountByStack,
}: StackFilterProps) {
  const options: FilterOption[] = stacks.map((stack) => ({
    value: stack,
    label: stack,
    count: projectCountByStack[stack] ?? 0,
  }));

  return (
    <FilterDropdown
      label="Stack"
      options={options}
      selected={selected}
      onChange={onChange}
      multiSelect={true}
    />
  );
}
