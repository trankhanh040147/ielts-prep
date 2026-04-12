import '@testing-library/jest-dom/vitest';

const createStorage = () => {
  let values: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    setItem: (key: string, value: string) => {
      values[key] = String(value);
    },
    removeItem: (key: string) => {
      delete values[key];
    },
    clear: () => {
      values = {};
    }
  };
};

if (typeof window !== 'undefined') {
  const localStorageValue = window.localStorage as unknown;
  if (!localStorageValue || typeof localStorageValue !== 'object') {
    Object.defineProperty(window, 'localStorage', {
      value: createStorage(),
      configurable: true
    });
  } else {
    const storage = localStorageValue as { getItem?: unknown };
    if (typeof storage.getItem !== 'function') {
      Object.defineProperty(window, 'localStorage', {
        value: createStorage(),
        configurable: true
      });
    }
  }
}
