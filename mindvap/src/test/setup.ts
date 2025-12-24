import '@testing-library/jest-dom';

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() { }
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() { }
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});

// Mock localStorage
const localStorageMock: any = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  clear: () => { },
  length: 0,
  key: () => null,
};
(global as any).localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock: any = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  clear: () => { },
  length: 0,
  key: () => null,
};
(global as any).sessionStorage = sessionStorageMock;

// Mock crypto for password hashing
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.getRandomValues(arr),
    randomUUID: () => 'mock-uuid',
  },
});

// Mock fetch
(global as any).fetch = () => Promise.resolve({ ok: true });

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => { },
});

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

// Mock log service globally to avoid import.meta issues in tests
jest.mock('../infrastructure/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));