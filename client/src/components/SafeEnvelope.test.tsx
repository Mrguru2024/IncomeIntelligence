
import { render, screen, fireEvent } from '@testing-library/react';
import { SafeEnvelope } from './SafeEnvelope';

describe('SafeEnvelope', () => {
  it('renders safe envelope component', () => {
    render(<SafeEnvelope />);
    expect(screen.getByText(/Safe Envelope/i)).toBeInTheDocument();
  });

  it('shows envelope balance', () => {
    render(<SafeEnvelope />);
    expect(screen.getByText(/Balance/i)).toBeInTheDocument();
  });

  it('displays lock status', () => {
    render(<SafeEnvelope />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
