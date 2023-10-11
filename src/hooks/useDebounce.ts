//reusable debounce hook
import { useEffect } from "react";
import useTimeout from "./useTimeout";

let count = 0;

const useDebounce = (
  callBack: () => void,
  delay: number,
  dependencies: [any]
) => {
  const { reset, clear, set } = useTimeout(callBack, delay);
  useEffect(() => {
    set();
    count++;
    if (count > delay) {
      reset();
      count = 0;
    }
  }, [...dependencies, reset]);
  useEffect(clear, []);
};

export default useDebounce;
