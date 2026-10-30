import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// jsdom lacks layout APIs used by Radix and cmdk.
beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        },
    );
    HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
    cleanup();
});
