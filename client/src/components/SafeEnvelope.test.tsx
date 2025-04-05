
import { render, screen, fireEvent } from '@testing-library/react';
import SafeEnvelope from './SafeEnvelope';

jest.mock('lucide-react', () => ({
  Lock: () => <div data-testid="lock-icon" />,
  Unlock: () => <div data-testid="unlock-icon" />
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

  it('displays correct spending amount', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
  });

  it('shows lock icon when unlocked', () => {
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
