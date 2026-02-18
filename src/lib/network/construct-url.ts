const BASE_URL = 'https://test.api.vectorcam.org';

export function constructUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const base = BASE_URL.replace(/\/+$/, '');
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    return `${base}${endpoint}`;
}
