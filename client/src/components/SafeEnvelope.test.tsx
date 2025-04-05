
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('displays lock status and handles toggle', () => {
    const onLockToggle = jest.fn();
    render(<SafeEnvelope {...defaultProps} onLockToggle={onLockToggle} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onLockToggle).toHaveBeenCalled();
  });
});
