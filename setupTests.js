import "@testing-library/jest-dom";
import "@testing-library/user-event";

import { cleanup } from "@testing-library/react";
import { beforeAll } from "@jest/globals";


beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    // eslint-disable-next-line no-undef
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      // eslint-disable-next-line no-undef
      addListener: jest.fn(), // Deprecated
      // eslint-disable-next-line no-undef
      removeListener: jest.fn(), // Deprecated
      // eslint-disable-next-line no-undef
      addEventListener: jest.fn(),
      // eslint-disable-next-line no-undef
      removeEventListener: jest.fn(),
      // eslint-disable-next-line no-undef
      dispatchEvent: jest.fn(),
    })),
  });
});

// // afterEach is globally available in Jest
// eslint-disable-next-line no-undef
afterEach(() => {
  cleanup();
  // eslint-disable-next-line no-undef
  jest.restoreAllMocks();
  // eslint-disable-next-line no-undef
  jest.clearAllTimers();
});
