
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

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockReturnValue({
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
  beforeEach(() => {
    render(<CashFlowCoach />, { wrapper });
  });

  it('renders spending patterns section', () => {
    expect(screen.getByText(/Spending Patterns/i)).toBeInTheDocument();
  });

  it('displays spending categories', () => {
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('shows spending amounts', () => {
    expect(screen.getByText(/\$450/)).toBeInTheDocument();
    expect(screen.getByText(/\$380/)).toBeInTheDocument();
  });
});
