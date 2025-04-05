import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CashFlowCoach from './CashFlowCoach';
import { formatCurrency } from '@/lib/utils/format';

const queryClient = new QueryClient();

describe('CashFlowCoach', () => {
  it('renders spending patterns section', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CashFlowCoach />
      </QueryClientProvider>
    );

    expect(screen.getByText('Spending Patterns')).toBeInTheDocument();
  });

  it('displays formatted currency amounts', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CashFlowCoach />
      </QueryClientProvider>
    );

    expect(screen.getByText(formatCurrency(450))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(380))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(200))).toBeInTheDocument();
  });

  it('shows savings opportunity section', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CashFlowCoach />
      </QueryClientProvider>
    );

    expect(screen.getByText('Savings Opportunities')).toBeInTheDocument();
    expect(screen.getByText(/Reduce restaurant spending/)).toBeInTheDocument();
  });

  it('has functional buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CashFlowCoach />
      </QueryClientProvider>
    );

    expect(screen.getByText('Get Personalized Tips')).toBeInTheDocument();
    expect(screen.getByText('Schedule Review')).toBeInTheDocument();
  });
});