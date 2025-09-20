import { useEffect, useRef } from "react";


function protectFromUnmount() {
  let callbacks = {};
  let isUnmounted = false;
  let count = 0;
  const noop = (...value) => value;

  const wrapCallback = (key) =>
    (...params) => {
      if (isUnmounted) {
        return noop(...params);
      }
      const callback = callbacks[key];
      delete callbacks[key];
      if (!callback) {
        return noop(...params);
      }
      return callback(...params);
    };

  const protect = (callback) => {
    if (isUnmounted) {
      return noop;
    }
    const key = count++;
    callbacks[key] = callback;
    return wrapCallback(key);
  };

  protect.unmount = () => {
    // 清空
    isUnmounted = true;
    callbacks = {};
  };

  protect.reset = () => {
    isUnmounted = false;
    callbacks = {};
  };

  return protect;
}

/**
 *  主要用于数据请求时
 */
export function useProtect() {
  const protectRef = useRef(protectFromUnmount());

  useEffect(() => {
    const protect = protectRef.current;
    protect.reset();
    return () => {
      protect && protect.unmount();
    };
  }, []);

  return [protectRef.current];
}
