
import { render, screen } from '@testing-library/react';
import { SafeEnvelope } from './SafeEnvelope';

const mockedProps = {
  balance: 1000,
  isLocked: false,
  onLockToggle: jest.fn()
};

describe('SafeEnvelope', () => {
  it('renders safe envelope component', () => {
    render(<SafeEnvelope {...mockedProps} />);
    expect(screen.getByText(/Safe Envelope/i)).toBeInTheDocument();
  });
});
