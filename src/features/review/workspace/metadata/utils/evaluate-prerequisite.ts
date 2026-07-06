import type {
    PrerequisiteExpression,
    PrerequisiteOperator,
    PrerequisiteValue,
} from '@/api/form-question/validation/prerequisite-expression-schema';

export function isPrerequisiteMet(
    expression: PrerequisiteExpression,
    resolveReference: (questionId: number) => string | null | undefined,
): boolean {
    if ('all' in expression) {
        return expression.all.every(branch =>
            isPrerequisiteMet(branch, resolveReference),
        );
    }
    if ('any' in expression) {
        return expression.any.some(branch =>
            isPrerequisiteMet(branch, resolveReference),
        );
    }
    const value = resolveReference(expression.questionId);
    if (value === undefined) return true; // indeterminate → leave answerable
    return evaluatePredicate(value, expression.operator, expression.value);
}

function evaluatePredicate(
    value: string | null,
    operator: PrerequisiteOperator,
    target: PrerequisiteValue | undefined,
): boolean {
    const isEmpty = value === null || value === '';
    if (operator === 'empty') return isEmpty;
    if (operator === 'not_empty') return !isEmpty;
    if (isEmpty) {
        return (
            operator === 'neq' ||
            operator === 'not_in' ||
            operator === 'not_contains'
        );
    }
    switch (operator) {
        case 'eq':
            return value === String(target);
        case 'neq':
            return value !== String(target);
        case 'gt':
            return Number(value) > Number(target);
        case 'gte':
            return Number(value) >= Number(target);
        case 'lt':
            return Number(value) < Number(target);
        case 'lte':
            return Number(value) <= Number(target);
        case 'in':
            return Array.isArray(target) && target.map(String).includes(value);
        case 'not_in':
            return (
                !Array.isArray(target) || !target.map(String).includes(value)
            );
        case 'contains':
            return value.includes(String(target));
        case 'not_contains':
            return !value.includes(String(target));
        default:
            return false;
    }
}
