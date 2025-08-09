// Create mock client
const mockClient = {
  post: jest.fn(),
};

// Mock the request module
jest.mock("src/requests", () => ({
  post: jest.fn(),
  formatRequestError: jest.fn(),
  makeSafeRequest: jest.fn(() => () => mockClient),
}));

import { formatRequestError } from "src/requests";

// Import validators after mocking
import { expansionValidator, remoteValidator } from "src/common/validators";

describe("validators", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("expansionValidator", () => {
    it("should resolve when no config is provided", async () => {
      const value = { output: "test" };
      const rule = { message: "test message" };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should resolve when config is empty", async () => {
      const value = { output: "test" };
      const rule = { expansionValidator: {}, message: "test message" };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should resolve when value is empty", async () => {
      const value = null;
      const rule = { expansionValidator: true, message: "test message" };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should resolve when value has no error and no length constraints", async () => {
      const value = { output: "test" };
      const rule = { expansionValidator: true, message: "test message" };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should reject when value has error", async () => {
      const value = { error: "test error" };
      const rule = { expansionValidator: true, message: "custom message" };

      await expect(expansionValidator(value, rule)).rejects.toBe("test error");
    });

    it("should reject when array length exceeds max", async () => {
      const value = { output: ["item1", "item2", "item3"] };
      const rule = {
        expansionValidator: { max: 2 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when string length exceeds max", async () => {
      const value = { output: "test string" };
      const rule = {
        expansionValidator: { max: 5 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when array length is less than min", async () => {
      const value = { output: ["item1"] };
      const rule = {
        expansionValidator: { min: 3 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when string length is less than min", async () => {
      const value = { output: "test" };
      const rule = {
        expansionValidator: { min: 10 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should use default error message when no custom message provided", async () => {
      const value = { output: ["item1", "item2", "item3"] };
      const rule = { expansionValidator: { max: 2 } };

      await expect(expansionValidator(value, rule)).rejects.toBe("最大长度为 2");
    });

    it("should resolve when array length is within bounds", async () => {
      const value = { output: ["item1", "item2"] };
      const rule = {
        expansionValidator: { min: 1, max: 5 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should resolve when string length is within bounds", async () => {
      const value = { output: "test" };
      const rule = {
        expansionValidator: { min: 1, max: 10 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should reject when required is true and value.output is empty", async () => {
      const value = { output: "" };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when required is true and value.output is null", async () => {
      const value = { output: null };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when required is true and value.output is undefined", async () => {
      const value = { output: undefined };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should reject when required is true and value.output is empty array", async () => {
      const value = { output: [] };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should resolve when required is true and value.output has content", async () => {
      const value = { output: "test content" };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should resolve when required is true and value.output is non-empty array", async () => {
      const value = { output: ["item1"] };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).resolves.toBeUndefined();
    });

    it("should use custom message when required validation fails and custom message provided", async () => {
      const value = { output: "" };
      const rule = {
        expansionValidator: { required: true },
        message: "This field is required",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("This field is required");
    });

    it("should use default message when required validation fails and no custom message", async () => {
      const value = { output: "" };
      const rule = {
        expansionValidator: { required: true },
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("请按照要求输入数据");
    });

    it("should combine required with min/max validation", async () => {
      const value = { output: "ab" };
      const rule = {
        expansionValidator: { required: true, min: 5 },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("custom message");
    });

    it("should prioritize error over required validation", async () => {
      const value = { output: "", error: "processing error" };
      const rule = {
        expansionValidator: { required: true },
        message: "custom message",
      };

      await expect(expansionValidator(value, rule)).rejects.toBe("processing error");
    });

  });

  describe("remoteValidator", () => {
    it("should resolve when value is empty", async () => {
      const value = null;
      const rule = { remoteValidator: { restful: "api/validate" } };
      const ctx = {};

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
    });

    it("should resolve when config is empty", async () => {
      const value = "test";
      const rule = {};
      const ctx = {};

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
    });

    it("should resolve when config has no restful", async () => {
      const value = "test";
      const rule = { remoteValidator: {} };
      const ctx = {};

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
    });

    it("should create client with default options when validation is successful", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          withForm: false,
          extraParams: { key: "value" },
          reqConfig: { timeout: 5000 }
        },
        message: "custom message"
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();

      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: "testField",
          extraParams: { key: "value" }
        },
        { disableNotiError: true, timeout: 5000 }
      );
    });

    it("should create client with custom makeRequestOptions", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          makeRequestOptions: {
            delay: 500,
            key: "custom-key"
          }
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
    });

    it("should reject when validation fails", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          withForm: true
        },
        message: "custom message"
      };
      const ctx = {
        field: { path: { entire: "testField" } },
        form: { values: { name: "test", age: 25 } }
      };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: false, message: "validation failed" }
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("validation failed");
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: "testField",
          extraParams: undefined,
          form: { name: "test", age: 25 }
        },
        { disableNotiError: true }
      );
    });

    it("should reject with custom message when validation fails and no server message", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        },
        message: "custom message"
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: false }
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("custom message");
    });

    it("should reject with default message when validation fails and no custom message", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: false }
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("请按照要求输入数据");
    });

    it("should reject when request fails", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      const error = new Error("Network error");
      mockClient.post.mockRejectedValue(error);
      formatRequestError.mockReturnValue({
        message: "Network Error",
        description: "Failed to connect"
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("Network Error: Failed to connect");
      expect(formatRequestError).toHaveBeenCalledWith(error);
    });

    it("should include form data when withForm is true", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          withForm: true,
          extraParams: { type: "user" }
        }
      };
      const ctx = {
        field: { path: { entire: "testField" } },
        form: { values: { username: "john", email: "john@example.com" } }
      };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: "testField",
          extraParams: { type: "user" },
          form: { username: "john", email: "john@example.com" }
        },
        { disableNotiError: true }
      );
    });

    it("should not include form data when withForm is false", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          withForm: false
        }
      };
      const ctx = {
        field: { path: { entire: "testField" } },
        form: { values: { username: "john", email: "john@example.com" } }
      };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: "testField",
          extraParams: undefined
        },
        { disableNotiError: true }
      );
    });

    it("should handle missing ctx.field.path.entire", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = { field: {} };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: undefined,
          extraParams: undefined
        },
        { disableNotiError: true }
      );
    });

    it("should handle missing ctx.form", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate",
          withForm: true
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: "testField",
          extraParams: undefined,
          form: undefined
        },
        { disableNotiError: true }
      );
    });

    it("should handle missing ctx.field", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = {};

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { validated: true }
      });

      await expect(remoteValidator(value, rule, ctx)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith(
        "api/validate",
        {
          value: "test",
          field: undefined,
          extraParams: undefined
        },
        { disableNotiError: true }
      );
    });

    it("should handle non-200 status code", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 400,
        data: { validated: false, message: "Bad request" }
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("Bad request");
    });

    it("should handle missing validated field in response", async () => {
      const value = "test";
      const rule = {
        remoteValidator: {
          restful: "api/validate"
        }
      };
      const ctx = { field: { path: { entire: "testField" } } };

      mockClient.post.mockResolvedValue({
        status: 200,
        data: { message: "Some message" }
      });

      await expect(remoteValidator(value, rule, ctx)).rejects.toBe("Some message");
    });
  });

});
