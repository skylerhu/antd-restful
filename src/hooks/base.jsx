import { useMemo, useReducer, useRef } from "react";
import { dequal as deepEqual } from "dequal";


// 用于处理object参数频繁变更的问题
export function useDeepCompareMemoize(value) {
  const ref = useRef(value);

  const memValue = useMemo(() => {
    if (value === ref.current || deepEqual(value, ref.current)) {
      return ref.current;
    }
    ref.current = value;
    return value;
  }, [value]);

  return memValue;
}

function updateStateReducer(state, values) {
  const newV = { ...state, ...values };
  if (deepEqual(newV, state)) {
    return state;
  }
  return newV;
}
// 多个state值集中维护管理
export function useDictState(data) {
  const [state, setState] = useReducer(updateStateReducer, data);

  return [state, setState];
}
