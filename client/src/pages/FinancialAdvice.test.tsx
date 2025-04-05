import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinancialAdvice from './FinancialAdvice';
import { useToast } from '@/hooks/use-toast';

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

// Mock query client and react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockImplementation(({ queryKey }) => {
    if (queryKey[0] === '/api/incomes') {
      return {
        data: [
          { id: 1, description: 'Salary', amount: 5000, date: '2023-01-01' },
          { id: 2, description: 'Freelance', amount: 1000, date: '2023-01-15' }
        ],
        isLoading: false
      };
    }
    if (queryKey[0] === '/api/expenses') {
      return {
        data: [
          { id: 1, description: 'Rent', amount: 1500, category: 'Housing', date: '2023-01-05' },
          { id: 2, description: 'Groceries', amount: 500, category: 'Food', date: '2023-01-10' }
        ],
        isLoading: false
      };
    }
    if (queryKey[0] === '/api/goals') {
      return {
        data: [
          { id: 1, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 5000 },
          { id: 2, name: 'Vacation', targetAmount: 3000, currentAmount: 1000 }
        ],
        isLoading: false
      };
    }
    return { data: null, isLoading: false };
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    isSuccess: false,
    data: {
      advice: 'You should save more for your emergency fund.',
      suggestions: ['Cut unnecessary expenses', 'Increase income sources'],
      summary: 'Your financial situation looks good, but improvements can be made.',
      provider: 'openai'
    }
  }),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn()
  })
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="card-footer">{children}</div>
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-title">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="alert-description">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode, defaultValue: string }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  )
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder }: { value: string, onChange?: (e: any) => void, placeholder?: string }) => (
    <textarea 
      data-testid="textarea" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
    />
  )
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
  RocketIcon: () => <div data-testid="rocket-icon">Rocket</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh</div>,
  PlusCircle: () => <div data-testid="plus-icon">Plus</div>
}));

describe('FinancialAdvice Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the financial advice component', () => {
    render(<FinancialAdvice />);
    
    // Check if the main title is present
    expect(screen.getByText(/Financial Advice/i)).toBeInTheDocument();
  });

  it('displays form and allows question input', () => {
    render(<FinancialAdvice />);
    
    // Find the textarea for the question input
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    
    // Type a question
    fireEvent.change(textarea, { target: { value: 'How can I save more money?' } });
    expect(textarea.value).toBe('How can I save more money?');
  });

  it('submits question and generates advice', async () => {
    const { mutate } = jest.requireMock('@tanstack/react-query').useMutation();
    
    render(<FinancialAdvice />);
    
    // Type a question
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'How can I save more money?' } });
    
    // Click generate advice button
    const generateButton = screen.getByRole('button', { name: /Generate Advice/i });
    fireEvent.click(generateButton);
    
    // Verify that the mutation was called
    expect(mutate).toHaveBeenCalled();
    
    // Wait for the advice to be displayed
    await waitFor(() => {
      expect(screen.getByText(/You should save more for your emergency fund./i)).toBeInTheDocument();
    });
  });

  it('displays provider information for the generated advice', async () => {
    render(<FinancialAdvice />);
    
    // Generate advice
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'How can I save more money?' } });
    
    const generateButton = screen.getByRole('button', { name: /Generate Advice/i });
    fireEvent.click(generateButton);
    
    // Wait for the provider information to be displayed
    await waitFor(() => {
      expect(screen.getByText(/OpenAI/i)).toBeInTheDocument();
    });
  });

  it('handles error states gracefully', async () => {
    // Override the mutation mock to return an error state
    jest.requireMock('@tanstack/react-query').useMutation.mockReturnValueOnce({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      data: {
        error: true,
        errorType: 'quota_exceeded'
      }
    });
    
    render(<FinancialAdvice />);
    
    // Generate advice
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'How can I save more money?' } });
    
    const generateButton = screen.getByRole('button', { name: /Generate Advice/i });
    fireEvent.click(generateButton);
    
    // Wait for error alert to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });
  });

  it('handles pending state with a loading indicator', async () => {
    // Override the mutation mock to return a pending state
    jest.requireMock('@tanstack/react-query').useMutation.mockReturnValueOnce({
      mutate: jest.fn(),
      isPending: true,
      isSuccess: false,
      data: null
    });
    
    render(<FinancialAdvice />);
    
    // Generate advice
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'How can I save more money?' } });
    
    const generateButton = screen.getByRole('button', { name: /Generate Advice/i });
    fireEvent.click(generateButton);
    
    // Check for loading indicator
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
  });
});