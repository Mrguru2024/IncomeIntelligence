
import { render, screen } from '@testing-library/react';
import { SafeEnvelope } from './SafeEnvelope';

describe('SafeEnvelope', () => {
  const defaultProps = {
    balance: 1000,
    isLocked: false,
    onLockToggle: jest.fn()
  };

  it('renders safe envelope component', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText(/Safe Envelope/i)).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
  });

  it('displays lock status', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
