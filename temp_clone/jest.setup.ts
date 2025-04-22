import "@testing-library/jest-dom";

// Needed for React 18 compatibility
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock fetch for testing API calls
global.fetch = jest.fn();

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock sessionStorage
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock matchMedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  disconnect = jest.fn();
  observe = jest.fn();
  unobserve = jest.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: any) {}
  disconnect = jest.fn();
  observe = jest.fn();
  unobserve = jest.fn();
};

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out act() warnings
  if (
    typeof args[0] === "string" &&
    args[0].includes("Warning: ReactDOM.render") &&
    args[0].includes("act(...)")
  ) {
    return;
  }
  originalConsoleError(...args);
};
