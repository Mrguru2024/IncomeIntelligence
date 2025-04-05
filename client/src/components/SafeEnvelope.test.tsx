
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SafeEnvelope from './SafeEnvelope';

// Mock the formatCurrency function directly
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  Lock: () => <div data-testid="lock-icon">LockIcon</div>,
  Unlock: () => <div data-testid="unlock-icon">UnlockIcon</div>
}));

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mock-card ${className || ''}`}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mock-card-header ${className || ''}`}>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mock-card-title ${className || ''}`}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mock-card-content ${className || ''}`}>{children}</div>,
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number, className?: string }) => <div className={`mock-progress ${className || ''}`} data-value={value}>Progress</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, 'aria-label': ariaLabel }: { children: React.ReactNode, onClick?: () => void, className?: string, 'aria-label'?: string }) => (
    <button onClick={onClick} className={`mock-button ${className || ''}`} aria-label={ariaLabel}>{children}</button>
  )
}));

describe('SafeEnvelope', () => {
  const mockLockToggle = jest.fn();
  const defaultProps = {
    category: 'Test Category',
    allocated: 1000,
    spent: 500,
    total: 1000,
    isLocked: false,
    onLockToggle: mockLockToggle
  };

  beforeEach(() => {
    mockLockToggle.mockClear();
  });

  it('renders category name', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('displays correct amounts', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText(/Spent: \$500.00/)).toBeInTheDocument();
    expect(screen.getByText(/Budget: \$1000.00/)).toBeInTheDocument();
  });

  it('shows unlock icon when unlocked', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByTestId('unlock-icon')).toBeInTheDocument();
  });

  it('calls onLockToggle when clicked', () => {
    render(<SafeEnvelope {...defaultProps} />);
    const lockButton = screen.getByRole('button', { name: /toggle lock/i });
    fireEvent.click(lockButton);
    expect(mockLockToggle).toHaveBeenCalledWith(!defaultProps.isLocked);
  });

  it('shows locked state correctly', () => {
    render(<SafeEnvelope {...defaultProps} isLocked={true} />);
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });
});
