import { useMemo, useRef } from "react";

export function useLastValidValue<T>(value: T): T {
    const lastValidValue = useRef<T>(value);

    return useMemo(() => {
        if (value) {
            lastValidValue.current = value;
        }
        return lastValidValue.current;
    }, [value]);
}
