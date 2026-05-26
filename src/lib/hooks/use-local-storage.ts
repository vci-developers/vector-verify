import { isValid } from 'date-fns';
import { useCallback, useRef, useState } from 'react';

type SetValue<T> = (value: T | ((previousValue: T) => T)) => void;

export interface LocalStorageOptions<T> {
    serialize: (value: T) => string;
    deserialize: (serializedValue: string) => T;
}

export const DATE_SERIALIZER: LocalStorageOptions<Date> = {
    serialize: (value: Date) => value.toISOString(),
    deserialize: (serializedValue: string) => {
        const date = new Date(serializedValue);
        if (!isValid(date)) throw new Error();
        return date;
    },
};

export const SET_SERIALIZER: LocalStorageOptions<Set<string>> = {
    serialize: (value: Set<string>) => JSON.stringify(Array.from(value)),
    deserialize: (serializedValue: string) =>
        new Set<string>(JSON.parse(serializedValue)),
};

export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    options?: LocalStorageOptions<T>,
): [T, SetValue<T>] {
    const serializeRef = useRef(options?.serialize ?? JSON.stringify);
    serializeRef.current = options?.serialize ?? JSON.stringify;
    const deserializeRef = useRef(options?.deserialize ?? JSON.parse);
    deserializeRef.current = options?.deserialize ?? JSON.parse;

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const serializedValue = window.localStorage.getItem(key);
            if (serializedValue === null) return defaultValue;
            return deserializeRef.current(serializedValue) as T;
        } catch {
            window.localStorage.removeItem(key);
            return defaultValue;
        }
    });

    const setValue: SetValue<T> = useCallback(
        newValue => {
            setStoredValue(previousValue => {
                const nextValue =
                    typeof newValue === 'function'
                        ? (newValue as (previousValue: T) => T)(previousValue)
                        : newValue;

                try {
                    window.localStorage.setItem(
                        key,
                        serializeRef.current(nextValue),
                    );
                } catch {}
                return nextValue;
            });
        },
        [key],
    );

    return [storedValue, setValue];
}
