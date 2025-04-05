
import { render, screen } from '@testing-library/react';
import { SafeEnvelope } from './SafeEnvelope';

jest.mock('lucide-react', () => ({
  LockIcon: () => <div data-testid="lock-icon" />,
  UnlockIcon: () => <div data-testid="unlock-icon" />
}));

describe('SafeEnvelope', () => {
  const defaultProps = {
    category: 'Test Category',
    allocated: 1000,
    spent: 500,
    total: 1000,
    isLocked: false,
    onLockToggle: jest.fn()
  };

  it('renders category name', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('displays correct spending amount', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
  });
});
