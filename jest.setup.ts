
import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Mock formatCurrency function
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));
