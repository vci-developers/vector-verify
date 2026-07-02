import { z } from 'zod';

export const prerequisiteOperatorSchema = z.enum([
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'not_in',
    'contains',
    'not_contains',
    'empty',
    'not_empty',
]);

export const prerequisiteValueSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.union([z.string(), z.number()])),
]);

export const prerequisitePredicateSchema = z.object({
    questionId: z.number(),
    operator: prerequisiteOperatorSchema,
    value: prerequisiteValueSchema.optional(),
});

export const prerequisiteExpressionSchema = z.union([
    prerequisitePredicateSchema,
    z.object({
        get all() {
            return z.array(prerequisiteExpressionSchema);
        },
    }),
    z.object({
        get any() {
            return z.array(prerequisiteExpressionSchema);
        },
    }),
]);

export type PrerequisiteOperator = z.infer<typeof prerequisiteOperatorSchema>;
export type PrerequisiteValue = z.infer<typeof prerequisiteValueSchema>;
export type PrerequisitePredicate = z.infer<typeof prerequisitePredicateSchema>;
export type PrerequisiteGroupConnector = 'all' | 'any';
export type PrerequisiteExpression = z.infer<
    typeof prerequisiteExpressionSchema
>;
