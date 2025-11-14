import { useRef } from "react";

type Timer = ReturnType<typeof setTimeout>;
type SomeFunction = (...args: unknown[]) => void;

export function useDebounce<Func extends SomeFunction>(func: Func, delay = 1000) {
  const timerRef = useRef<Timer | null>(null);

  const debouncedFunction = ((...args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }) as Func;

  return debouncedFunction;
}
