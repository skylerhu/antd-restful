import { useEffect, useRef, useState } from "react";

/**
 *  暂停的使用方式

const [delay, setDelay] = useState(1000);
const [isRunning, setIsRunning] = useState(true);

useInterval(() => {
  setCount(count + 1);
}, isRunning ? delay : null);

 * @param callback
 * @param delay
 * @param immediate 是否立即启用
 */
export function useInterval(callback, delay, immediate = false) {
  const savedCallback = useRef();
  // 记录手动调用方法的次数
  const [counter, setCounter] = useState(0);
  const [enable, setEnable] = useState(immediate);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (enable && delay && delay > 0) {
      const id = setInterval(() => {
        savedCallback.current();
      }, delay);
      return () => clearInterval(id);
    }
  }, [delay, enable, counter]);

  const runInterval = (enableInterval = true) => {
    // 立即执行一次
    savedCallback.current();
    // 每次执行后触发重置定时器
    setEnable(enableInterval);
    setCounter((c) => c + 1);
  };

  return [runInterval, setEnable];
}
