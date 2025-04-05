
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

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({
    data: {
      patterns: [
        { category: 'Restaurants', amount: 450, trend: 'up' },
        { category: 'Groceries', amount: 380, trend: 'down' }
      ]
    },
    isLoading: false,
    error: null
  })
}));

describe('CashFlowCoach', () => {
  it('renders spending patterns section', () => {
    render(<CashFlowCoach />, { wrapper });
    expect(screen.getByText('Spending Patterns')).toBeInTheDocument();
  });
});
