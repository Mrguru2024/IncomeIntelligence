import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CashFlowCoach from './CashFlowCoach';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('CashFlowCoach', () => {
  it('renders spending patterns section', () => {
    render(<CashFlowCoach />, { wrapper });
    expect(screen.getByText('Spending Patterns')).toBeInTheDocument();
  });

  it('shows savings opportunity section', () => {
    render(<CashFlowCoach />, { wrapper });
    expect(screen.getByText('Savings Opportunities')).toBeInTheDocument();
    expect(screen.getByText(/Reduce restaurant spending/)).toBeInTheDocument();
  });
});