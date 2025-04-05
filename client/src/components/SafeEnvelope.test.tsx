
import { render, screen, fireEvent } from '@testing-library/react';
import { SafeEnvelope } from './SafeEnvelope';

describe('SafeEnvelope', () => {
  const defaultProps = {
    category: 'Test Category',
    allocated: 1000,
    spent: 500,
    total: 1000,
    isLocked: false,
    onLockToggle: jest.fn()
  };

  it('renders safe envelope component', () => {
    render(<SafeEnvelope {...defaultProps} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('displays lock status and handles toggle', () => {
    const onLockToggle = jest.fn();
    render(<SafeEnvelope {...{...defaultProps, onLockToggle}} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onLockToggle).toHaveBeenCalled();
  });
});
