
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CashFlowCoach from './CashFlowCoach';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />
}));

describe('CashFlowCoach', () => {
  it('renders spending patterns heading', () => {
    render(<CashFlowCoach />, { wrapper });
    expect(screen.getByText(/Spending Patterns/i)).toBeInTheDocument();
  });
});
