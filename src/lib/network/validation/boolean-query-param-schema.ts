import { z } from 'zod';

function coerceBooleanString(item: unknown): unknown {
    if (item === 'true') return true;
    if (item === 'false') return false;
    return item;
}

export function booleanQueryParamSchema(): z.ZodType<boolean>;
export function booleanQueryParamSchema<T extends boolean>(
    enforce: T,
): z.ZodType<T>;
export function booleanQueryParamSchema(enforce?: boolean): z.ZodType<boolean> {
    return z.preprocess(
        coerceBooleanString,
        enforce === undefined ? z.boolean() : z.literal(enforce),
    );
}
