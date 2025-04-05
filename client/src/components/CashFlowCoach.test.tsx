
import { render, screen, fireEvent } from '@testing-library/react';
import CashFlowCoach from './CashFlowCoach';
import { formatCurrency } from '@/lib/utils/format';

describe('CashFlowCoach', () => {
  it('renders spending patterns', () => {
    render(<CashFlowCoach />);
    
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('displays formatted currency amounts', () => {
    render(<CashFlowCoach />);
    
    expect(screen.getByText(formatCurrency(450))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(380))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(200))).toBeInTheDocument();
  });

  it('shows savings opportunity section', () => {
    render(<CashFlowCoach />);
    
    expect(screen.getByText('Savings Opportunities')).toBeInTheDocument();
    expect(screen.getByText(/Reduce restaurant spending/)).toBeInTheDocument();
  });

  it('has functional buttons', () => {
    render(<CashFlowCoach />);
    
    expect(screen.getByText('Get Personalized Tips')).toBeInTheDocument();
    expect(screen.getByText('Schedule Review')).toBeInTheDocument();
  });
});
