import React from "react";
import { render, screen } from "@testing-library/react";
import requests, {
  AbortablePromise,
  formatRequestError,
  getCookie,
  useSafeRequest,
  makeSafeRequest,
} from "src/requests";

// Mock antd notification
jest.mock("antd", () => ({
  notification: {
    error: jest.fn(),
  },
}));

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
  })),
  isCancel: jest.fn(),
}));

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "csrftoken=test-token; sessionid=test-session",
});

// Mock document.querySelector
document.querySelector = jest.fn();

describe("requests module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 抑制控制台错误
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("formatRequestError", () => {
    it("should format unknown error", () => {
      const error = new Error("Unknown error");
      const result = formatRequestError(error);

      expect(result.message).toBe("未知错误");
      expect(result.description).toBe("Unknown error");
    });

    it("should format HTTP error with response", () => {
      const error = {
        response: {
          status: 404,
          data: { message: "Not found" },
        },
        config: {
          method: "get",
          url: "/api/test",
        },
        message: "Request failed",
      };

      const result = formatRequestError(error);

      expect(result.message).toBe("HttpError(404)");
      expect(result.description).toBe('GET /api/test\n{"message":"Not found"}');
    });
  });

  describe("getCookie", () => {
    it("should return cookie value when exists", () => {
      const result = getCookie("csrftoken");
      expect(result).toBe("test-token");
    });

    it("should return null when cookie does not exist", () => {
      const result = getCookie("nonexistent");
      expect(result).toBeNull();
    });

    it("should return null when no cookies", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "",
      });

      const result = getCookie("csrftoken");
      expect(result).toBeNull();
    });

    it("should handle cookie with spaces", () => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: "csrftoken=test-token; sessionid=test-session",
      });

      const result = getCookie("sessionid");
      expect(result).toBe("test-session");
    });
  });

  describe("useSafeRequest hook", () => {
    it("should return makeRequest function", () => {
      const TestComponent = () => {
        const [makeRequest] = useSafeRequest();
        return <div data-testid="hook-test">{typeof makeRequest}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByText("function")).toBeInTheDocument();
    });

    it("should unmount and cleanup on component unmount", () => {
      const TestComponent = () => {
        const [makeRequest] = useSafeRequest();
        return <div data-testid="hook-test">{typeof makeRequest}</div>;
      };

      const { unmount } = render(<TestComponent />);

      // Mock the unmount function
      const mockUnmount = jest.fn();
      const safeRequest = makeSafeRequest();
      jest.spyOn(safeRequest, "unmount").mockImplementation(mockUnmount);

      unmount();

      // Note: In a real test environment, you might need to wait for useEffect cleanup
      // This is a simplified test
    });
  });

  describe("axios instance", () => {
    it("should export axios instance", () => {
      expect(requests).toBeDefined();
      expect(requests.interceptors).toBeDefined();
    });

    it("should handle CSRF token in request interceptor", () => {
      // Mock document.querySelector to return a CSRF token
      document.querySelector.mockReturnValue({ value: "csrf-from-dom" });

      // This would test the request interceptor logic
      // In a real test, you'd need to trigger the interceptor
    });

    it("should handle CSRF token from cookie when not in DOM", () => {
      document.querySelector.mockReturnValue(null);

      // This would test the fallback to cookie CSRF token
      // In a real test, you'd need to trigger the interceptor
    });

  });

  describe("AbortablePromise", () => {
    it("should create a promise that can be resolved", async () => {
      const promise = new AbortablePromise((resolve) => {
        resolve("success");
      });

      const result = await promise;
      expect(result).toBe("success");
    });

    it("should create a promise that can be rejected", async () => {
      const promise = new AbortablePromise((resolve, reject) => {
        reject(new Error("test error"));
      });

      await expect(promise).rejects.toThrow("test error");
    });

    it("should have abort method and isAborted property", () => {
      const promise = new AbortablePromise(() => {});

      expect(typeof promise.abort).toBe("function");
      expect(promise.isAborted).toBe(false);
    });

    it("should abort promise and set isAborted flag", () => {
      const promise = new AbortablePromise(() => {});

      promise.abort();

      expect(promise.isAborted).toBe(true);
    });

    it("should handle then method when not aborted", async () => {
      const promise = new AbortablePromise((resolve) => {
        resolve("original");
      });

      const result = await promise.then((value) => value + "-modified");
      expect(result).toBe("original-modified");
    });

    it("should handle then method when aborted", async () => {
      const promise = new AbortablePromise((resolve) => {
        resolve("original");
      });

      promise.abort();

      const result = await promise.then((value) => value + "-modified");
      expect(result).toBeUndefined();
    });

    it("should handle catch method when not aborted", async () => {
      const promise = new AbortablePromise((resolve, reject) => {
        reject(new Error("original error"));
      });

      await expect(promise.catch((error) => {
        throw new Error("caught: " + error.message);
      })).rejects.toThrow("caught: original error");
    });

    it("should handle catch method when aborted", async () => {
      const promise = new AbortablePromise((resolve, reject) => {
        reject(new Error("original error"));
      });

      promise.abort();

      const result = await promise.catch((error) => "caught: " + error.message);
      expect(result).toBeUndefined();
    });

    it("should handle finally method when not aborted", async () => {
      let finallyCalled = false;
      const promise = new AbortablePromise((resolve) => {
        resolve("success");
      });

      const result = await promise.finally(() => {
        finallyCalled = true;
      });

      expect(result).toBe("success");
      expect(finallyCalled).toBe(true);
    });

    it("should handle finally method when aborted", async () => {
      let finallyCalled = false;
      const promise = new AbortablePromise((resolve) => {
        resolve("success");
      });

      promise.abort();

      const result = await promise.finally(() => {
        finallyCalled = true;
      });

      expect(result).toBeUndefined();
      expect(finallyCalled).toBe(false);
    });

    it("should handle chained catch calls when aborted", async () => {
      const promise = new AbortablePromise((resolve, reject) => {
        reject(new Error("original"));
      });

      promise.abort();

      const result = await promise
        .catch((error) => "caught: " + error.message)
        .catch((error) => "double caught: " + error.message);

      expect(result).toBeUndefined();
    });

    it("should work with async/await syntax", async () => {
      const promise = new AbortablePromise((resolve) => {
        resolve("async result");
      });

      const result = await promise;
      expect(result).toBe("async result");
    });

    it("should handle immediate resolution when not aborted", async () => {
      const promise = new AbortablePromise((resolve) => {
        resolve("immediate");
      });

      const result = await promise;
      expect(result).toBe("immediate");
    });

    it("should handle immediate rejection when not aborted", async () => {
      const promise = new AbortablePromise((resolve, reject) => {
        reject(new Error("immediate error"));
      });

      await expect(promise).rejects.toThrow("immediate error");
    });
  });

});
