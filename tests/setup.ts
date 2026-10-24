import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no layout observer, but Radix tooltips need the API to mount.
vi.stubGlobal(
    'ResizeObserver',
    class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    },
);

afterEach(() => {
    cleanup();
});
