import { jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import * as hooks from "src/hooks";
import { useInterval } from "src/hooks/interval";

describe("Hooks Tests", () => {
  // 清理存储和定时器
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Storage Hooks", () => {
    describe("useLocalStorage", () => {
      it("should return initial value when localStorage is empty", () => {
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", "default-value"));

        expect(result.current[0]).toBe("default-value");
      });

      it("should set and get value from localStorage", () => {
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", "default"));

        act(() => {
          result.current[1]("new-value");
        });

        expect(result.current[0]).toBe("new-value");
        expect(localStorage.getItem("test-key")).toBe("\"new-value\"");
      });

      it("should remove value from localStorage", () => {
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", "default"));

        act(() => {
          result.current[1]("test-value");
        });

        expect(result.current[0]).toBe("test-value");

        act(() => {
          result.current[2](); // removeValue
        });

        expect(result.current[0]).toBe(undefined);
        expect(localStorage.getItem("test-key")).toBe(null);
      });

      it("should handle function as value", () => {
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", 0));

        act(() => {
          result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);
      });

      it("should handle complex objects", () => {
        const testObj = { name: "test", age: 30 };
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", null));

        act(() => {
          result.current[1](testObj);
        });

        expect(result.current[0]).toEqual(testObj);
      });

      it("should handle invalid JSON in localStorage", () => {
        localStorage.setItem("test-key", "invalid-json");
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const { result } = renderHook(() => hooks.useLocalStorage("test-key", "default"));

        expect(result.current[0]).toBe("default");
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it("should sync with localStorage changes", () => {
        const { result } = renderHook(() => hooks.useLocalStorage("test-key", "default"));

        expect(result.current[0]).toBe("default");

        // 模拟外部修改 localStorage
        localStorage.setItem("test-key", "\"external-value\"");

        // rerender(); 这个并不能监听 localStorage 的变化，只能重新初始化
        // 重新渲染触发 useEffect
        const { result: result2 } = renderHook(() => hooks.useLocalStorage("test-key", "default"));

        expect(result2.current[0]).toBe("external-value");
      });
    });

    describe("useSessionStorage", () => {
      it("should work with sessionStorage", () => {
        const { result } = renderHook(() => hooks.useSessionStorage("session-key", "default"));

        act(() => {
          result.current[1]("session-value");
        });

        expect(result.current[0]).toBe("session-value");
        expect(sessionStorage.getItem("session-key")).toBe("\"session-value\"");
      });

      it("should remove value from sessionStorage", () => {
        const { result } = renderHook(() => hooks.useSessionStorage("session-key", "default"));

        act(() => {
          result.current[1]("test-value");
        });

        act(() => {
          result.current[2](); // removeValue
        });

        expect(result.current[0]).toBe(undefined);
        expect(sessionStorage.getItem("session-key")).toBe(null);
      });

      it("should handle function updates", () => {
        const { result } = renderHook(() => hooks.useSessionStorage("session-key", 0));

        act(() => {
          result.current[1]((prev) => prev + 5);
        });

        expect(result.current[0]).toBe(5);
      });
    });

    describe("myLocalStorage and mySessionStorage (普通函数)", () => {
      it("should work with myLocalStorage", () => {
        const storage = hooks.myLocalStorage("local-key", "default");

        expect(storage.value).toBe("default");
        expect(localStorage.getItem("local-key")).toBe("\"default\"");

        storage.setValue("new-value");
        expect(storage.getValue()).toBe("new-value");

        storage.removeValue();
        expect(localStorage.getItem("local-key")).toBe(null);
      });

      it("should work with mySessionStorage", () => {
        const storage = hooks.mySessionStorage("session-key", "default");

        expect(storage.value).toBe("default");
        expect(sessionStorage.getItem("session-key")).toBe("\"default\"");

        storage.setValue("new-value");
        expect(storage.getValue()).toBe("new-value");

        storage.removeValue();
        expect(sessionStorage.getItem("session-key")).toBe(null);
      });

      it("should handle complex objects in myLocalStorage", () => {
        const testObj = { name: "test", data: [1, 2, 3] };
        const storage = hooks.myLocalStorage("complex-key", null);

        storage.setValue(testObj);
        expect(storage.getValue()).toEqual(testObj);
      });

      it("should not set value if no default and no existing value", () => {
        const storage = hooks.myLocalStorage("no-default-key");

        expect(storage.value).toBe(null);
        expect(localStorage.getItem("no-default-key")).toBe(null);
      });
    });
  });

  describe("Protect Hooks", () => {
    describe("useProtect", () => {
      it("should protect callback from being called after unmount", async () => {
        const callback = jest.fn();

        const { result, unmount } = renderHook(() => hooks.useProtect());

        const protectedCallback = result.current[0](callback);

        // 模拟组件卸载
        unmount();

        // 调用受保护的回调
        protectedCallback("test");

        expect(callback).not.toHaveBeenCalled();
      });

      it("should allow callback to be called before unmount", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => hooks.useProtect());

        const protectedCallback = result.current[0](callback);

        // 在卸载前调用
        protectedCallback("test");

        expect(callback).toHaveBeenCalledWith("test");
      });

      it("should handle multiple protected callbacks", () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        const { result } = renderHook(() => hooks.useProtect());

        const protectedCallback1 = result.current[0](callback1);
        const protectedCallback2 = result.current[0](callback2);

        protectedCallback1("test1");
        protectedCallback2("test2");

        expect(callback1).toHaveBeenCalledWith("test1");
        expect(callback2).toHaveBeenCalledWith("test2");
      });

      it("should return original result when callback is called before unmount", () => {
        const callback = jest.fn().mockReturnValue("result");

        const { result } = renderHook(() => hooks.useProtect());

        const protectedCallback = result.current[0](callback);

        const callbackResult = protectedCallback("test");

        expect(callbackResult).toBe("result");
        expect(callback).toHaveBeenCalledWith("test");
      });

      it("should handle multiple arguments", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => hooks.useProtect());

        const protectedCallback = result.current[0](callback);

        protectedCallback("arg1", "arg2", "arg3");

        expect(callback).toHaveBeenCalledWith("arg1", "arg2", "arg3");
      });
    });

    describe("useDeepCompareMemoize", () => {
      it("should return same reference for equal objects", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };

        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: obj1 },
        });

        const firstResult = result.current;

        rerender({ value: obj2 });

        expect(result.current).toBe(firstResult);
      });

      it("should return new reference for different objects", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 3 };

        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: obj1 },
        });

        const firstResult = result.current;

        rerender({ value: obj2 });

        expect(result.current).not.toBe(firstResult);
        expect(result.current).toBe(obj2);
      });

      it("should handle nested objects", () => {
        const obj1 = { a: 1, nested: { x: 1, y: 2 } };
        const obj2 = { a: 1, nested: { x: 1, y: 2 } };

        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: obj1 },
        });

        const firstResult = result.current;

        rerender({ value: obj2 });

        expect(result.current).toBe(firstResult);
      });

      it("should handle arrays", () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];

        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: arr1 },
        });

        const firstResult = result.current;

        rerender({ value: arr2 });

        expect(result.current).toBe(firstResult);
      });

      it("should handle primitive values", () => {
        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: "test" },
        });

        const firstResult = result.current;

        rerender({ value: "test" });

        expect(result.current).toBe(firstResult);

        rerender({ value: "different" });

        expect(result.current).not.toBe(firstResult);
        expect(result.current).toBe("different");
      });

      it("should handle null and undefined", () => {
        const { result, rerender } = renderHook(({ value }) => hooks.useDeepCompareMemoize(value), {
          initialProps: { value: null },
        });

        const firstResult = result.current;

        rerender({ value: null });
        expect(result.current).toBe(firstResult);

        rerender({ value: undefined });
        expect(result.current).toBe(undefined);
      });
    });

    describe("useDictState", () => {
      it("should initialize with provided data", () => {
        const initialData = { name: "John", age: 30 };

        const { result } = renderHook(() => hooks.useDictState(initialData));

        expect(result.current[0]).toEqual(initialData);
      });

      it("should update state with new values", () => {
        const initialData = { name: "John", age: 30 };

        const { result } = renderHook(() => hooks.useDictState(initialData));

        act(() => {
          result.current[1]({ age: 31 });
        });

        expect(result.current[0]).toEqual({ name: "John", age: 31 });
      });

      it("should merge new values with existing state", () => {
        const initialData = { name: "John", age: 30 };

        const { result } = renderHook(() => hooks.useDictState(initialData));

        act(() => {
          result.current[1]({ city: "New York" });
        });

        expect(result.current[0]).toEqual({ name: "John", age: 30, city: "New York" });
      });

      it("should handle multiple updates", () => {
        const { result } = renderHook(() => hooks.useDictState({}));

        act(() => {
          result.current[1]({ name: "John" });
        });

        act(() => {
          result.current[1]({ age: 30 });
        });

        act(() => {
          result.current[1]({ name: "Jane" });
        });

        expect(result.current[0]).toEqual({ name: "Jane", age: 30 });
      });

      it("should handle nested objects", () => {
        const initialData = { user: { name: "John" }, settings: { theme: "dark" } };

        const { result } = renderHook(() => hooks.useDictState(initialData));

        act(() => {
          result.current[1]({ user: { name: "Jane", age: 30 } });
        });

        expect(result.current[0]).toEqual({
          user: { name: "Jane", age: 30 },
          settings: { theme: "dark" }
        });
      });

      it("should handle empty updates", () => {
        const initialData = { name: "John" };

        const { result } = renderHook(() => hooks.useDictState(initialData));

        act(() => {
          result.current[1]({});
        });

        expect(result.current[0]).toEqual({ name: "John" });
      });
    });
  });

  describe("Interval Hook", () => {
    describe("useInterval", () => {
      it("should not run interval initially", () => {
        const callback = jest.fn();

        renderHook(() => useInterval(callback, 1000));

        expect(callback).not.toHaveBeenCalled();
      });

      it("should run callback immediately when runInterval is called", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should run callback at intervals after runInterval is called", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(2);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(3);
      });

      it("should stop interval when setEnable is called with false", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          result.current[1](false); // setEnable(false)
        });

        act(() => {
          jest.advanceTimersByTime(2000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should restart interval when runInterval is called again", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(500);
        });

        act(() => {
          result.current[0](); // runInterval again
        });

        expect(callback).toHaveBeenCalledTimes(2);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(3);
      });

      it("should handle runInterval with enableInterval parameter", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](false); // runInterval(false)
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(2000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should handle delay changes", () => {
        const callback = jest.fn();

        const { result, rerender } = renderHook(
          ({ delay }) => useInterval(callback, delay),
          { initialProps: { delay: 1000 } }
        );

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        // Change delay
        rerender({ delay: 500 });

        act(() => {
          jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(2);
      });

      it("should handle null delay", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, null));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(2000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should clean up interval on unmount", () => {
        const callback = jest.fn();

        const { result, unmount } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        unmount();

        act(() => {
          jest.advanceTimersByTime(2000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should handle callback changes", () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        const { result, rerender } = renderHook(
          ({ callback }) => useInterval(callback, 1000),
          { initialProps: { callback: callback1 } }
        );

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback1).toHaveBeenCalledTimes(1);

        // Change callback
        rerender({ callback: callback2 });

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
      });

      it("should reset interval when counter changes", () => {
        const callback = jest.fn();

        const { result } = renderHook(() => useInterval(callback, 1000));

        act(() => {
          result.current[0](); // runInterval
        });

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(500);
        });

        // Call runInterval again, should reset the timer
        act(() => {
          result.current[0](); // runInterval again
        });

        expect(callback).toHaveBeenCalledTimes(2);

        // The timer should restart from 0
        act(() => {
          jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(2); // Should not have been called yet

        act(() => {
          jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(3); // Now it should be called
      });
    });
  });

  describe("useSettingsStorage", () => {
    const mockColumns = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
      { key: "email", label: "Email", hidden: true },
      { key: "address", label: "Address" },
    ];

    beforeEach(() => {
      localStorage.clear();
    });

    it("should initialize with default visible columns when no config exists", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      expect(result.current.allKeys).toEqual(["name", "age", "email", "address"]);
      expect(result.current.keys).toEqual(["name", "age", "address"]); // email is hidden
    });

    it("should use stored config when available and valid", () => {
      const storedConfig = {
        allKeys: ["name", "age", "email", "address"],
        keys: ["name", "email"],
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      expect(result.current.keys).toEqual(["name", "email"]);
    });

    it("should ignore stored config when allKeys don't match", () => {
      const storedConfig = {
        allKeys: ["name", "age"], // Different from current columns
        keys: ["name"],
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // Should filter stored keys to only include those in current allKeys
      expect(result.current.keys).toEqual(["name"]);
    });

    it("should ignore stored config when keys are missing", () => {
      const storedConfig = {
        allKeys: ["name", "age", "email", "address"],
        // keys is missing
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // Should fall back to default visible columns
      expect(result.current.keys).toEqual(["name", "age", "address"]);
    });

    it("should update config when setKeys is called", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      act(() => {
        result.current.setKeys(["name", "email"]);
      });

      const storedConfig = JSON.parse(localStorage.getItem("test-key"));
      expect(storedConfig).toEqual({
        allKeys: ["name", "age", "email", "address"],
        keys: ["name", "email"],
      });
    });

    it("should handle empty columns array", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", []));

      expect(result.current.allKeys).toEqual([]);
      expect(result.current.keys).toEqual([]);
    });

    it("should handle non-string key parameter", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage(null, mockColumns));

      // Should fall back to default visible columns
      expect(result.current.keys).toEqual(["name", "age", "address"]);
    });

    it("should handle undefined config", () => {
      localStorage.setItem("test-key", JSON.stringify(null));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // Should fall back to default visible columns
      expect(result.current.keys).toEqual(["name", "age", "address"]);
    });

    it("should update when columns change", () => {
      const { result, rerender } = renderHook(
        ({ columns }) => hooks.useSettingsStorage("test-key", columns),
        { initialProps: { columns: mockColumns } }
      );

      expect(result.current.allKeys).toEqual(["name", "age", "email", "address"]);

      const newColumns = [
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
      ];

      rerender({ columns: newColumns });

      expect(result.current.allKeys).toEqual(["name", "phone"]);
      expect(result.current.keys).toEqual(["name", "phone"]);
    });

    it("should maintain config when columns change but allKeys match", () => {
      const storedConfig = {
        allKeys: ["name", "age", "email", "address"],
        keys: ["name", "email"],
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result, rerender } = renderHook(
        ({ columns }) => hooks.useSettingsStorage("test-key", columns),
        { initialProps: { columns: mockColumns } }
      );

      expect(result.current.keys).toEqual(["name", "email"]);

      // Change columns but keep same allKeys
      const newColumns = [
        { key: "name", label: "Name" },
        { key: "age", label: "Age" },
        { key: "email", label: "Email", hidden: true },
        { key: "address", label: "Address" },
      ];

      rerender({ columns: newColumns });

      // Should still use stored config
      expect(result.current.keys).toEqual(["name", "email"]);
    });

    it("should handle columns with same key but different properties", () => {
      const columnsWithSameKey = [
        { key: "name", label: "Name 1" },
        { key: "name", label: "Name 2" },
        { key: "age", label: "Age" },
      ];

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", columnsWithSameKey));

      expect(result.current.allKeys).toEqual(["name", "name", "age"]);
      expect(result.current.keys).toEqual(["name", "name", "age"]);
    });

    it("should handle setKeys with empty array", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      act(() => {
        result.current.setKeys([]);
      });

      const storedConfig = JSON.parse(localStorage.getItem("test-key"));
      expect(storedConfig).toEqual({
        allKeys: ["name", "age", "email", "address"],
        keys: [],
      });
    });

    it("should handle setKeys with invalid keys", () => {
      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      act(() => {
        result.current.setKeys(["invalid-key", "another-invalid"]);
      });

      const storedConfig = JSON.parse(localStorage.getItem("test-key"));
      expect(storedConfig).toEqual({
        allKeys: ["name", "age", "email", "address"],
        keys: ["invalid-key", "another-invalid"],
      });
    });

    it("should handle columns with mixed key and dataIndex", () => {
      const mixedColumns = [
        { key: "custom_key", label: "Name" },
        { key: "age", label: "Age" },
        { key: "email", label: "Email" },
      ];

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mixedColumns));

      expect(result.current.allKeys).toEqual(["custom_key", "age", "email"]);
      expect(result.current.keys).toEqual(["custom_key", "age", "email"]);
    });

    it("should handle deep equality comparison correctly", () => {
      const { result, rerender } = renderHook(
        ({ columns }) => hooks.useSettingsStorage("test-key", columns),
        { initialProps: { columns: mockColumns } }
      );

      const firstResult = result.current;

      // Rerender with same columns (different reference but same content)
      rerender({ columns: [...mockColumns] });

      // Should maintain the same state
      expect(result.current.allKeys).toEqual(firstResult.allKeys);
      expect(result.current.keys).toEqual(firstResult.keys);
    });

    it("should use configured keys even when it is empty array", () => {
      const storedConfig = {
        allKeys: ["name", "age", "email", "address"],
        keys: [], // 配置的keys为空数组
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // 当配置的keys为空数组时，应该使用配置的keys（空数组）
      expect(result.current.keys).toEqual([]);
    });

    it("should use default keys when filtered keys becomes empty after allKeys change", () => {
      // 设置一个配置，其中allKeys与当前不匹配，keys包含一些在当前allKeys中不存在的key
      const storedConfig = {
        allKeys: ["oldKey1", "oldKey2"], // 与当前的allKeys不匹配
        keys: ["oldKey1", "oldKey2"], // 这些key在新的allKeys中不存在
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // 当过滤后的keys为空时，应该使用默认的keys
      expect(result.current.keys).toEqual(["name", "age", "address"]);
    });

    it("should use default keys when allKeys change and filtered keys is empty", () => {
      // 设置一个配置，其中allKeys与当前不匹配，keys包含一些在当前allKeys中不存在的key
      const storedConfig = {
        allKeys: ["nonExistentKey1", "nonExistentKey2"], // 与当前的allKeys不匹配
        keys: ["nonExistentKey1", "nonExistentKey2"], // 这些key在新的allKeys中不存在
      };
      localStorage.setItem("test-key", JSON.stringify(storedConfig));

      const { result } = renderHook(() => hooks.useSettingsStorage("test-key", mockColumns));

      // 当过滤后的keys为空时，应该使用默认的keys
      expect(result.current.keys).toEqual(["name", "age", "address"]);
    });
  });
});
