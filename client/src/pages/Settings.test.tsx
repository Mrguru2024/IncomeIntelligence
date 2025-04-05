import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';

// Use jest.doMock instead of jest.mock for easier mocking
// and manually require here instead of using import statements
jest.mock('../../hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

jest.mock('../../hooks/useIncomeStore', () => ({
  useIncomeStore: jest.fn().mockReturnValue({
    needsPercentage: 40,
    investmentsPercentage: 30,
    savingsPercentage: 30,
    updatePercentages: jest.fn()
  })
}));

// Mock query client and react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockImplementation(({ queryKey }) => {
    if (queryKey[0] === '/api/ai/settings') {
      return {
        data: {
          CACHE_ENABLED: true,
          CACHE_EXPIRY: 604800000,
          CACHE_DIR: './.cache',
          DEFAULT_PROVIDER: 'openai',
          AUTO_FALLBACK: true,
          MAX_RETRIES: 3
        },
        isLoading: false,
        error: null
      };
    }
    return { data: null, isLoading: false, error: null };
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false
  }),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn()
  })
}));

// Mock UI components
jest.mock('../../components/ui/tabs', () => {
  const React = require('react');
  return {
    Tabs: function Tabs({ children, defaultValue }: { children: React.ReactNode, defaultValue: string }) {
      return React.createElement('div', {
        'data-testid': 'tabs',
        'data-default-value': defaultValue
      }, children);
    },
    TabsContent: function TabsContent({ children, value }: { children: React.ReactNode, value: string }) {
      return React.createElement('div', {
        'data-testid': `tabs-content-${value}`
      }, children);
    },
    TabsList: function TabsList({ children }: { children: React.ReactNode }) {
      return React.createElement('div', {
        'data-testid': 'tabs-list'
      }, children);
    },
    TabsTrigger: function TabsTrigger({ children, value }: { children: React.ReactNode, value: string }) {
      return React.createElement('button', {
        'data-testid': `tab-trigger-${value}`
      }, children);
    }
  };
});

jest.mock('../../components/ui/card', () => {
  const React = require('react');
  return {
    Card: function Card({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'card' }, children);
    },
    CardHeader: function CardHeader({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'card-header' }, children);
    },
    CardTitle: function CardTitle({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'card-title' }, children);
    },
    CardDescription: function CardDescription({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'card-description' }, children);
    },
    CardContent: function CardContent({ children }: { children: React.ReactNode }) {
      return React.createElement('div', { 'data-testid': 'card-content' }, children);
    }
  };
});

jest.mock('../../components/ui/radio-group', () => {
  const React = require('react');
  return {
    RadioGroup: function RadioGroup({ 
      children, 
      value, 
      onValueChange 
    }: { 
      children: React.ReactNode, 
      value: string, 
      onValueChange: (value: string) => void 
    }) {
      return React.createElement('div', {
        'data-testid': 'radio-group',
        'data-value': value,
        onClick: () => onValueChange('anthropic')
      }, children);
    },
    RadioGroupItem: function RadioGroupItem({ value, id }: { value: string, id: string }) {
      return React.createElement('div', {
        'data-testid': `radio-item-${id}`,
        'data-value': value
      });
    }
  };
});

jest.mock('../../components/ui/switch', () => {
  const React = require('react');
  return {
    Switch: function Switch({ 
      checked, 
      onCheckedChange, 
      id 
    }: { 
      checked: boolean, 
      onCheckedChange: (checked: boolean) => void, 
      id: string 
    }) {
      return React.createElement('button', {
        'data-testid': `switch-${id}`,
        'data-checked': checked,
        onClick: () => onCheckedChange(!checked)
      }, 'Toggle');
    }
  };
});

jest.mock('../../components/ui/button', () => {
  const React = require('react');
  return {
    Button: function Button({ 
      children, 
      onClick, 
      disabled 
    }: { 
      children: React.ReactNode, 
      onClick?: () => void, 
      disabled?: boolean 
    }) {
      return React.createElement('button', {
        onClick,
        disabled,
        'data-testid': 'button'
      }, children);
    }
  };
});

jest.mock('../../components/ui/input', () => {
  const React = require('react');
  return {
    Input: function Input({ 
      id, 
      type, 
      value, 
      onChange, 
      min, 
      max 
    }: { 
      id: string, 
      type: string, 
      value: string | number, 
      onChange: (e: any) => void, 
      min?: number, 
      max?: number 
    }) {
      return React.createElement('input', {
        'data-testid': `input-${id}`,
        type,
        value,
        onChange: (e: any) => onChange(e),
        min,
        max
      });
    }
  };
});

jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    Loader2: function Loader2() {
      return React.createElement('div', { 'data-testid': 'loader' }, 'Loading...');
    },
    CheckCircle: function CheckCircle() {
      return React.createElement('div', { 'data-testid': 'check-circle' }, 'Check');
    }
  };
});

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the settings component with all tabs', () => {
    render(<Settings />);
    
    // Check if all tabs are present
    expect(screen.getByTestId('tab-trigger-general')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-split-ratio')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-ai-settings')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-account')).toBeInTheDocument();
  });

  it('displays the AI settings tab content correctly', async () => {
    render(<Settings />);
    
    // Find and click on the AI settings tab
    const aiSettingsTab = screen.getByTestId('tab-trigger-ai-settings');
    fireEvent.click(aiSettingsTab);
    
    // Confirm AI settings section is visible
    expect(screen.getByTestId('tabs-content-ai-settings')).toBeInTheDocument();
    
    // Check for specific AI settings content
    await waitFor(() => {
      // Verify the provider selection is visible
      expect(screen.getByTestId('radio-group')).toBeInTheDocument();
      expect(screen.getByTestId('radio-item-openai')).toBeInTheDocument();
      expect(screen.getByTestId('radio-item-anthropic')).toBeInTheDocument();
      
      // Verify switches are present
      expect(screen.getByTestId('switch-auto-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('switch-cache-enabled')).toBeInTheDocument();
      
      // Verify input for max retries
      expect(screen.getByTestId('input-max-retries')).toBeInTheDocument();
    });
  });

  it('handles AI settings changes correctly', async () => {
    const { queryClient } = jest.requireMock('@tanstack/react-query');
    const invalidateQueries = queryClient.invalidateQueries;
    
    render(<Settings />);
    
    // Navigate to AI settings tab
    fireEvent.click(screen.getByTestId('tab-trigger-ai-settings'));
    
    // Toggle auto fallback switch
    fireEvent.click(screen.getByTestId('switch-auto-fallback'));
    
    // Change provider to Anthropic
    fireEvent.click(screen.getByTestId('radio-group'));
    
    // Update max retries
    fireEvent.change(screen.getByTestId('input-max-retries'), { target: { value: '5' } });
    
    // Save settings
    fireEvent.click(screen.getByTestId('button'));
    
    // Verify that the mutation was triggered and cache invalidated
    const { mutate } = jest.requireMock('@tanstack/react-query').useMutation();
    expect(mutate).toHaveBeenCalled();
    
    // Wait for toast message
    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['/api/ai/settings'] });
    });
  });

  it('displays the split ratio settings content correctly', () => {
    render(<Settings />);
    
    // Navigate to split ratio tab
    fireEvent.click(screen.getByTestId('tab-trigger-split-ratio'));
    
    // Verify split ratio content is visible
    expect(screen.getByTestId('tabs-content-split-ratio')).toBeInTheDocument();
  });

  it('updates and saves split ratio changes', async () => {
    const { updatePercentages } = jest.requireMock('../../hooks/useIncomeStore').useIncomeStore();
    const { toast } = jest.requireMock('../../hooks/use-toast').useToast();
    
    render(<Settings />);
    
    // Navigate to split ratio tab
    fireEvent.click(screen.getByTestId('tab-trigger-split-ratio'));
    
    // Find the save button and click it
    const saveButton = screen.getByTestId('button');
    fireEvent.click(saveButton);
    
    // Verify the update function was called
    expect(updatePercentages).toHaveBeenCalled();
    
    // Verify toast notification
    expect(toast).toHaveBeenCalled();
  });
});