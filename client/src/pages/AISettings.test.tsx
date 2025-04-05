import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// A focused test component that just tests the AI Settings UI
const AISettings = () => {
  const [provider, setProvider] = React.useState('openai');
  const [autoFallback, setAutoFallback] = React.useState(true);
  const [cacheEnabled, setCacheEnabled] = React.useState(true);
  const [maxRetries, setMaxRetries] = React.useState(3);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSave = () => {
    // Simulate saving
    setTimeout(() => setIsSuccess(true), 100);
  };

  return (
    <div data-testid="ai-settings">
      <h2>AI Settings</h2>
      
      <div>
        <label htmlFor="provider">Provider</label>
        <div data-testid="provider-selection">
          <div>
            <input
              type="radio"
              id="openai"
              name="provider"
              value="openai"
              checked={provider === 'openai'}
              onChange={() => setProvider('openai')}
              data-testid="provider-openai"
            />
            <label htmlFor="openai">OpenAI</label>
          </div>
          <div>
            <input
              type="radio"
              id="anthropic"
              name="provider"
              value="anthropic"
              checked={provider === 'anthropic'}
              onChange={() => setProvider('anthropic')}
              data-testid="provider-anthropic"
            />
            <label htmlFor="anthropic">Anthropic Claude</label>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="auto-fallback">Auto Fallback</label>
        <input
          type="checkbox"
          id="auto-fallback"
          checked={autoFallback}
          onChange={() => setAutoFallback(!autoFallback)}
          data-testid="auto-fallback"
        />
      </div>
      
      <div>
        <label htmlFor="cache-enabled">Cache Enabled</label>
        <input
          type="checkbox"
          id="cache-enabled"
          checked={cacheEnabled}
          onChange={() => setCacheEnabled(!cacheEnabled)}
          data-testid="cache-enabled"
        />
      </div>
      
      <div>
        <label htmlFor="max-retries">Max Retries</label>
        <input
          type="number"
          id="max-retries"
          value={maxRetries}
          onChange={(e) => setMaxRetries(Number(e.target.value))}
          min={0}
          max={10}
          data-testid="max-retries"
        />
      </div>
      
      <button onClick={handleSave} data-testid="save-button">
        Save Settings
      </button>
      
      {isSuccess && (
        <div data-testid="success-message">Settings saved successfully!</div>
      )}
    </div>
  );
};

describe('AI Settings Component', () => {
  it('renders the AI settings component', () => {
    render(<AISettings />);
    
    // Check if the component title is rendered
    expect(screen.getByText('AI Settings')).toBeInTheDocument();
    
    // Check if provider options are present
    expect(screen.getByTestId('provider-openai')).toBeInTheDocument();
    expect(screen.getByTestId('provider-anthropic')).toBeInTheDocument();
    
    // Check if other controls are present
    expect(screen.getByTestId('auto-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('cache-enabled')).toBeInTheDocument();
    expect(screen.getByTestId('max-retries')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });
  
  it('handles changes to settings', async () => {
    render(<AISettings />);
    
    // Change provider to Anthropic
    fireEvent.click(screen.getByTestId('provider-anthropic'));
    expect(screen.getByTestId('provider-anthropic')).toBeChecked();
    
    // Toggle auto fallback
    fireEvent.click(screen.getByTestId('auto-fallback'));
    expect(screen.getByTestId('auto-fallback')).not.toBeChecked();
    
    // Change max retries
    fireEvent.change(screen.getByTestId('max-retries'), { target: { value: '5' } });
    expect(screen.getByTestId('max-retries')).toHaveValue(5);
    
    // Save settings
    fireEvent.click(screen.getByTestId('save-button'));
    
    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });
});