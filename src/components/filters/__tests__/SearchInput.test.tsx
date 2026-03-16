import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SearchInput from '../SearchInput';

describe('SearchInput', () => {

  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Search projects...',
    debounceMs: 300,
  };

  it('renders with placeholder text', () => {
    render(<SearchInput {...defaultProps} />);
    
    const input = screen.getByRole('searchbox', { name: /search projects/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search projects...');
  });

  it('displays initial value', () => {
    render(<SearchInput {...defaultProps} value="react" />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('react');
  });

  it('shows search icon by default', () => {
    render(<SearchInput {...defaultProps} />);
    
    const icon = screen.getByRole('searchbox').previousElementSibling;
    expect(icon).toBeInTheDocument();
    expect(icon?.classList.contains('search-input-spinner')).toBe(false);
  });

  it('shows spinner while debouncing', async () => {
    render(<SearchInput {...defaultProps} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      const spinner = document.querySelector('.search-input-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('debounces input changes', async () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(onChange).not.toHaveBeenCalled();
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
  });

  it('does not call onChange if value has not changed', async () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} value="test" onChange={onChange} />);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows clear button when input has value', () => {
    render(<SearchInput {...defaultProps} value="test" />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when input is empty', () => {
    render(<SearchInput {...defaultProps} />);
    
    const clearButton = screen.queryByRole('button', { name: /clear search/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} value="test" onChange={onChange} />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clears input on Escape key when focused', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} value="test" onChange={onChange} />);
    
    const input = screen.getByRole('searchbox');
    input.focus();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not clear on Escape when input is empty', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    input.focus();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not clear on Escape when input is not focused', () => {
    const onChange = vi.fn();
    render(
      <div>
        <SearchInput {...defaultProps} value="test" onChange={onChange} />
        <button>Other</button>
      </div>
    );
    
    const otherButton = screen.getByRole('button', { name: /other/i });
    otherButton.focus();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(<SearchInput {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search projects');
    expect(input).toHaveAttribute('aria-describedby', 'search-help');
    expect(input).toHaveAttribute('aria-controls', 'projects-grid');
  });

  it('provides screen reader help text', () => {
    render(<SearchInput {...defaultProps} />);
    
    const helpText = document.getElementById('search-help');
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveTextContent(/search by title.*press escape to clear/i);
    expect(helpText).toHaveClass('sr-only');
  });

  it('updates local value when prop value changes', () => {
    const { rerender } = render(<SearchInput {...defaultProps} value="" />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('');
    
    rerender(<SearchInput {...defaultProps} value="new value" />);
    
    expect(input).toHaveValue('new value');
  });

  it('cancels debounce timer on unmount', async () => {
    const onChange = vi.fn();
    const { unmount } = render(<SearchInput {...defaultProps} onChange={onChange} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    unmount();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects custom debounce time', async () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} debounceMs={500} onChange={onChange} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(onChange).not.toHaveBeenCalled();
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 300 });
  });

  it('hides spinner after debounce completes', async () => {
    render(<SearchInput {...defaultProps} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(document.querySelector('.search-input-spinner')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(document.querySelector('.search-input-spinner')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});
