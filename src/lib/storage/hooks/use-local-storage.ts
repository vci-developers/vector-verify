import { isValid } from 'date-fns';
import { useState } from 'react';

type SetValue<T> = (value: T | ((previousValue: T) => T)) => void;

export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
): [T, SetValue<T>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const storedItem = window.localStorage.getItem(key);
            if (storedItem === null) return defaultValue;

            const parsedStoredItem: unknown = JSON.parse(storedItem);

            if (defaultValue instanceof Date) {
                const date = new Date(parsedStoredItem as string);
                if (!isValid(date)) {
                    window.localStorage.removeItem(key);
                    return defaultValue;
                }
                return date as T;
            }
            return parsedStoredItem as T;
        } catch {
            window.localStorage.removeItem(key);
            return defaultValue;
        }
    });

    const setValue: SetValue<T> = newItem => {
        setStoredValue(previousValue => {
            const newStoredItem =
                typeof newItem === 'function'
                    ? (newItem as (previousValue: T) => T)(previousValue)
                    : newItem;

            try {
                const newStoredItemJson =
                    defaultValue instanceof Date &&
                    newStoredItem instanceof Date
                        ? JSON.stringify(newStoredItem.toISOString())
                        : JSON.stringify(newStoredItem);
                window.localStorage.setItem(key, newStoredItemJson);
            } catch {}
            return newStoredItem;
        });
    };

    return [storedValue, setValue];
}
