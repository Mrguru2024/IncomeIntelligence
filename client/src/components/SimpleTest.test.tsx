import { render, screen } from '@testing-library/react';

describe('Simple Test', () => {
  it('should pass', () => {
    render(<div data-testid="test">Test</div>);
    expect(screen.getByTestId('test')).toHaveTextContent('Test');
  });
});