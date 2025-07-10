import { useCallback, useEffect, useState } from "react";
import { dequal as deepEqual } from "dequal";

const _getStorageValue = (storage, key, defaultValue) => {
  let value;
  // Get from storage by key
  const item = storage.getItem(key);
  try {
    // Parse stored json or if none return initialValue
    value = item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // If error also return initialValue
    console.error("useStorage", item, error); // eslint-disable-line no-console
    value = defaultValue;
  }
  return value;
};

/**
 * 参照 https://github.com/leny/react-use-storage
 const [value, setValue, removeValue] = useSessionStorage('key', 'default value');
 const [value, setValue, removeValue] = useLocalStorage('key', 'default value');
 * @param storage
 */
const _storageManage = (storage) => {
  const func = (key, defaultValue = null) => {
    const raw = storage.getItem(key);

    const getValue = () => _getStorageValue(storage, key, defaultValue);
    const value = getValue();

    const setValue = (updatedValue) => storage.setItem(key, JSON.stringify(updatedValue));

    if (defaultValue !== null && !raw) {
      setValue(defaultValue);
    }

    const removeValue = () => storage.removeItem(key);

    return { value, getValue, setValue, removeValue };
  };
  return func;
};

// 不适用hook的情况
export const myLocalStorage = _storageManage(window.localStorage);
export const mySessionStorage = _storageManage(window.sessionStorage);

function genStorage(storage) {
  // Hook
  function useStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(_getStorageValue(storage, key, initialValue));

    useEffect(() => {
      setStoredValue((oldV) => {
        let value = _getStorageValue(storage, key, initialValue);
        if (deepEqual(value, oldV)) {
          return oldV;
        }
        return value;
      });
    }, [initialValue, key]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to storage.
    const setValue = useCallback(
      (value) => {
        try {
          // Allow value to be a function so we have same API as useState
          const valueToStore = value instanceof Function ? value(storedValue) : value;
          // Save state
          setStoredValue(valueToStore);
          // Save to storage
          storage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          // A more advanced implementation would handle the error case
          console.error("useStorage", value, error); // eslint-disable-line no-console
        }
      },
      [key, storedValue]
    );
    const removeValue = useCallback(() => {
      storage.removeItem(key);
      setStoredValue(undefined);
    }, [key]);

    return [storedValue, setValue, removeValue];
  }
  return useStorage;
}

export const useLocalStorage = genStorage(window.localStorage);
export const useSessionStorage = genStorage(window.sessionStorage);
