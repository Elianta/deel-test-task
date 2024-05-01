/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const debouncedFunction = function (...args: Parameters<T>) {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            func(...args);
        }, delay);
    };

    debouncedFunction.cancel = () => {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    return debouncedFunction as ((...args: Parameters<T>) => void) & {
        cancel: () => void;
    };
};
