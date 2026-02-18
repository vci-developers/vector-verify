type NetworkErrorKind =
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'timeout'
    | 'conflict'
    | 'rate_limited'
    | 'client'
    | 'server'
    | 'network'
    | 'unknown';

export type NetworkError = {
    kind: NetworkErrorKind;
    status?: number;
    message?: string;
};

export function networkErrorMessage(error: NetworkError): string {
    if (error.message && error.message.trim() !== '') return error.message;

    switch (error.kind) {
        case 'unauthorized':
            return 'Unauthorized access. Please log in again.';
        case 'forbidden':
            return 'You do not have permission to perform this action.';
        case 'not_found':
            return 'The requested resource was not found.';
        case 'timeout':
            return 'The request timed out. Please try again.';
        case 'conflict':
            return 'There was a conflict with your request. Please check and try again.';
        case 'rate_limited':
            return 'You have made too many requests. Please wait and try again later.';
        case 'client':
            return 'Your request was invalid. Please check and try again.';
        case 'server':
            return 'An error occurred on the server. Please try again later.';
        case 'network':
            return 'A network error occurred. Please check your connection and try again.';
        default:
            return 'An unknown error occurred. Please try again.';
    }
}

export function statusToNetworkErrorKind(status: number): NetworkErrorKind {
    if (status == 401) return 'unauthorized';
    if (status == 403) return 'forbidden';
    if (status == 404) return 'not_found';
    if (status == 408) return 'timeout';
    if (status == 409) return 'conflict';
    if (status == 429) return 'rate_limited';
    if (status == 502) return 'network';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500 && status < 600) return 'server';
    return 'unknown';
}
