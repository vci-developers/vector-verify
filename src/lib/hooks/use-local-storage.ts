import { isValid } from 'date-fns';
import { useCallback, useState } from 'react';

type SetValue<T> = (value: T | ((previousValue: T) => T)) => void;

export interface LocalStorageOptions<T> {
    serialize: (value: T) => string;
    deserialize: (serializedValue: string) => T;
}

const DATE_SERIALIZER: LocalStorageOptions<Date> = {
    serialize: (value: Date) => value.toISOString(),
    deserialize: (serializedValue: string) => {
        const date = new Date(serializedValue);
        if (!isValid(date)) throw new Error();
        return date;
    },
};

const SET_SERIALIZER: LocalStorageOptions<Set<string>> = {
    serialize: (value: Set<string>) => JSON.stringify(Array.from(value)),
    deserialize: (serializedValue: string) =>
        new Set<string>(JSON.parse(serializedValue)),
};

function resolveSerializer<T>(
    defaultValue: T,
    options?: LocalStorageOptions<T>,
): LocalStorageOptions<T> {
    if (options) return options;
    if (defaultValue instanceof Date)
        return DATE_SERIALIZER as unknown as LocalStorageOptions<T>;
    if (defaultValue instanceof Set)
        return SET_SERIALIZER as unknown as LocalStorageOptions<T>;
    return { serialize: JSON.stringify, deserialize: JSON.parse };
}

export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    options?: LocalStorageOptions<T>,
): [T, SetValue<T>] {
    const { serialize, deserialize } = resolveSerializer(defaultValue, options);

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const serializedValue = window.localStorage.getItem(key);
            if (serializedValue === null) return defaultValue;
            return deserialize(serializedValue) as T;
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
                    window.localStorage.setItem(key, serialize(nextValue));
                } catch {}
                return nextValue;
            });
        },
        [key, serialize],
    );

    return [storedValue, setValue];
}
