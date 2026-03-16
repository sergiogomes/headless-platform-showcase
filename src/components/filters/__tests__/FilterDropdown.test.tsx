import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterDropdown, { type FilterOption } from '../FilterDropdown';

describe('FilterDropdown', () => {
  const mockOptions: FilterOption[] = [
    { value: 'react', label: 'React', count: 5 },
    { value: 'vue', label: 'Vue', count: 3 },
    { value: 'angular', label: 'Angular', count: 2 },
  ];

  const defaultProps = {
    label: 'Stack',
    options: mockOptions,
    selected: [],
    onChange: vi.fn(),
    multiSelect: true,
  };

  it('renders with label and no badge when nothing selected', () => {
    render(<FilterDropdown {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /stack/i })).toBeInTheDocument();
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
  });

  it('shows badge with count when items are selected', () => {
    render(<FilterDropdown {...defaultProps} selected={['react', 'vue']} />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens dropdown menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /stack/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: /react/i })).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FilterDropdown {...defaultProps} />
        <button>Outside</button>
      </div>
    );
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.click(screen.getByRole('button', { name: /outside/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown on Escape key', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('selects items in multi-select mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    const reactOption = screen.getByRole('menuitemcheckbox', { name: /react/i });
    await user.click(reactOption);
    
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('deselects items in multi-select mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} selected={['react']} onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    const reactOption = screen.getByRole('menuitemcheckbox', { name: /react/i });
    await user.click(reactOption);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('selects single item and closes in single-select mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} multiSelect={false} onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    const reactOption = screen.getByRole('menuitemcheckbox', { name: /react/i });
    await user.click(reactOption);
    
    expect(onChange).toHaveBeenCalledWith(['react']);
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /stack/i });
    await user.click(button);
    
    const firstItem = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(firstItem).toHaveFocus();
    
    await user.keyboard('{ArrowDown}');
    const secondItem = screen.getByRole('menuitemcheckbox', { name: /vue/i });
    expect(secondItem).toHaveFocus();
    
    await user.keyboard('{ArrowUp}');
    expect(firstItem).toHaveFocus();
  });

  it('navigates to first item with Home key', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    
    await user.keyboard('{Home}');
    
    const firstItem = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(firstItem).toHaveFocus();
  });

  it('navigates to last item with End key', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    await user.keyboard('{End}');
    
    const lastItem = screen.getByRole('menuitemcheckbox', { name: /angular/i });
    expect(lastItem).toHaveFocus();
  });

  it('implements focus trap with Tab key cycling through items', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /stack/i });
    await user.click(button);
    
    const firstItem = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(firstItem).toHaveFocus();
    
    await user.keyboard('{Tab}');
    const secondItem = screen.getByRole('menuitemcheckbox', { name: /vue/i });
    expect(secondItem).toHaveFocus();
  });

  it('selects item with Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    const firstItem = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(firstItem).toHaveFocus();
    
    await user.keyboard('{Enter}');
    
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('selects item with Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterDropdown {...defaultProps} onChange={onChange} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    
    const firstItem = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(firstItem).toHaveFocus();
    
    await user.keyboard(' ');
    
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('announces selection to screen readers', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /stack/i }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: /react/i }));
    
    const announcement = screen.getByRole('status');
    expect(announcement).toHaveTextContent(/react selected.*1 filter active/i);
  });

  it('shows correct ARIA attributes', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} selected={['react']} />);
    
    const button = screen.getByRole('button', { name: /stack/i });
    expect(button).toHaveAttribute('aria-haspopup', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
    
    const reactOption = screen.getByRole('menuitemcheckbox', { name: /react/i });
    expect(reactOption).toHaveAttribute('aria-checked', 'true');
    
    const vueOption = screen.getByRole('menuitemcheckbox', { name: /vue/i });
    expect(vueOption).toHaveAttribute('aria-checked', 'false');
  });
});
