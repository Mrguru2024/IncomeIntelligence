
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn()
  })
}));

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('handles theme toggle click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toBeInTheDocument();
  });
});
