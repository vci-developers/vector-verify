'use client';

import { createContext, useContext, type ReactNode } from 'react';

const CountryContext = createContext<string | undefined>(undefined);

interface CountryProviderProps {
    value: string;
    children: ReactNode;
}

export function CountryProvider({ value, children }: CountryProviderProps) {
    return (
        <CountryContext.Provider value={value}>
            {children}
        </CountryContext.Provider>
    );
}

export function useCountry(): string {
    const country = useContext(CountryContext);
    if (country === undefined) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return country;
}
