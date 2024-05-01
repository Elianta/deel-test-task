import { useCallback } from "react";
import type { ChangeEventHandler, FocusEventHandler } from "react";
import styles from "./styles.module.css";

export interface InputProps {
    value: string;
    onChange: (value: string) => void;
    onFocusChange?: (focused: boolean) => void;
    placeholder?: string;
    type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
}

const Input = ({
    value,
    onChange,
    onFocusChange,
    placeholder = "Placeholder...",
    type = "text",
}: InputProps) => {
    const _onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (onChange) onChange(e.target.value);
        },
        [onChange]
    );

    const _onFocus: FocusEventHandler<HTMLInputElement> = useCallback(() => {
        if (onFocusChange) onFocusChange(true);
    }, [onFocusChange]);

    const _onBlur: FocusEventHandler<HTMLInputElement> = useCallback(() => {
        if (onFocusChange) onFocusChange(false);
    }, [onFocusChange]);

    return (
        <input
            type={type}
            className={styles.input}
            value={value}
            placeholder={placeholder}
            onChange={_onChange}
            onFocus={_onFocus}
            onBlur={_onBlur}
        />
    );
};

export default Input;
