import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterChips from '../FilterChips';

describe('FilterChips', () => {
  const defaultProps = {
    searchQuery: '',
    selectedStacks: [],
    selectedDomains: [],
    selectedTags: [],
    onRemoveSearch: vi.fn(),
    onRemoveStack: vi.fn(),
    onRemoveDomain: vi.fn(),
    onRemoveTag: vi.fn(),
    onClearAll: vi.fn(),
  };

  it('renders nothing when no filters are active', () => {
    const { container } = render(<FilterChips {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders search chip when search query is present', () => {
    render(<FilterChips {...defaultProps} searchQuery="react" />);
    
    expect(screen.getByText(/search: react/i)).toBeInTheDocument();
  });

  it('renders stack chips', () => {
    render(<FilterChips {...defaultProps} selectedStacks={['React', 'Vue']} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('renders domain chips', () => {
    render(<FilterChips {...defaultProps} selectedDomains={['E-commerce', 'Healthcare']} />);
    
    expect(screen.getByText('E-commerce')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('renders tag chips', () => {
    render(<FilterChips {...defaultProps} selectedTags={['API', 'Dashboard']} />);
    
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all chip types together', () => {
    render(
      <FilterChips
        {...defaultProps}
        searchQuery="test"
        selectedStacks={['React']}
        selectedDomains={['E-commerce']}
        selectedTags={['API']}
      />
    );
    
    expect(screen.getByText(/search: test/i)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('E-commerce')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  it('calls onRemoveSearch when search chip remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveSearch = vi.fn();
    render(<FilterChips {...defaultProps} searchQuery="react" onRemoveSearch={onRemoveSearch} />);
    
    const removeButton = screen.getByRole('button', { name: /remove search "react"/i });
    await user.click(removeButton);
    
    expect(onRemoveSearch).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveStack when stack chip remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveStack = vi.fn();
    render(<FilterChips {...defaultProps} selectedStacks={['React', 'Vue']} onRemoveStack={onRemoveStack} />);
    
    const removeButton = screen.getByRole('button', { name: /remove react stack filter/i });
    await user.click(removeButton);
    
    expect(onRemoveStack).toHaveBeenCalledWith('React');
  });

  it('calls onRemoveDomain when domain chip remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveDomain = vi.fn();
    render(<FilterChips {...defaultProps} selectedDomains={['E-commerce']} onRemoveDomain={onRemoveDomain} />);
    
    const removeButton = screen.getByRole('button', { name: /remove e-commerce domain filter/i });
    await user.click(removeButton);
    
    expect(onRemoveDomain).toHaveBeenCalledWith('E-commerce');
  });

  it('calls onRemoveTag when tag chip remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(<FilterChips {...defaultProps} selectedTags={['API']} onRemoveTag={onRemoveTag} />);
    
    const removeButton = screen.getByRole('button', { name: /remove api tag filter/i });
    await user.click(removeButton);
    
    expect(onRemoveTag).toHaveBeenCalledWith('API');
  });

  it('calls onClearAll when clear all button is clicked', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(<FilterChips {...defaultProps} searchQuery="test" onClearAll={onClearAll} />);
    
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);
    
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('shows clear all button when any filter is active', () => {
    render(<FilterChips {...defaultProps} searchQuery="test" />);
    
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('has accessible remove button labels', () => {
    render(
      <FilterChips
        {...defaultProps}
        searchQuery="test query"
        selectedStacks={['React']}
        selectedDomains={['E-commerce']}
        selectedTags={['API']}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Remove search "test query"' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove React stack filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove E-commerce domain filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove API tag filter' })).toBeInTheDocument();
  });

  it('renders multiple chips of the same type', () => {
    render(<FilterChips {...defaultProps} selectedStacks={['React', 'Vue', 'Angular']} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
    
    const removeButtons = screen.getAllByRole('button', { name: /remove .* stack filter/i });
    expect(removeButtons).toHaveLength(3);
  });

  it('renders chips in correct order: search, stacks, domains, tags', () => {
    const { container } = render(
      <FilterChips
        {...defaultProps}
        searchQuery="test"
        selectedStacks={['React']}
        selectedDomains={['E-commerce']}
        selectedTags={['API']}
      />
    );
    
    const chips = container.querySelectorAll('.filter-chip');
    expect(chips[0]).toHaveTextContent(/search: test/i);
    expect(chips[1]).toHaveTextContent('React');
    expect(chips[2]).toHaveTextContent('E-commerce');
    expect(chips[3]).toHaveTextContent('API');
  });

  it('maintains unique keys for each chip', () => {
    const { container } = render(
      <FilterChips
        {...defaultProps}
        selectedStacks={['React', 'Vue']}
        selectedDomains={['E-commerce', 'Healthcare']}
      />
    );
    
    const chips = container.querySelectorAll('.filter-chip');
    expect(chips).toHaveLength(4);
  });
});
