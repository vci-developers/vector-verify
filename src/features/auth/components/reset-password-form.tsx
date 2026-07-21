'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    resetPasswordFormSchema,
    type ResetPasswordFormInput,
} from '@/features/auth/validation/reset-password-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Eye, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePostResetPassword } from '@/api/auth/hooks/use-post-reset-password';
import { useTranslations } from 'next-intl';

interface ResetPasswordProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const t = useTranslations('Auth');

    const { mutate: postResetPassword, isPending } = usePostResetPassword();

    const resetPasswordForm = useForm<ResetPasswordFormInput>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: ResetPasswordFormInput) {
        postResetPassword(
            { newPassword: data.password, token },
            {
                onSuccess: result => {
                    if (result.ok) {
                        setSubmitted(true);
                        setHasError(false);
                    } else {
                        setErrorMessage(
                            result.error.status === 400
                                ? t('invalidResetPasswordLink')
                                : result.error.status === 404
                                  ? t('userNotFoundOrEmailNotVerified')
                                  : t('somethingWentWrong'),
                        );
                    }
                },
                onError: () => {
                    setHasError(true);
                },
            },
        );
    }

    if (submitted) {
        return (
            <div className="text-center">
                <p className="text-muted-foreground text-sm leading-loose">
                    {t('passwordHasBeenReset')}
                </p>
                <Link
                    href="/login"
                    className="text-primary text-sm font-medium hover:underline"
                >
                    {t('returnToLogin')}
                </Link>
            </div>
        );
    }
    if (errorMessage) {
        return (
            <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground text-center text-sm">
                    {errorMessage}
                </p>
                <Link className="w-full" href="/forgot-password">
                    <Button className="w-full"> {t('forgotPassword')}</Button>
                </Link>
            </div>
        );
    }

    return (
        <form
            id="reset-password-rhf"
            onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <FieldGroup>
                <Controller
                    name="password"
                    control={resetPasswordForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="reset-password-password">
                                {t('newPassword')}
                            </FieldLabel>
                            <div className="relative">
                                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="reset-password-password"
                                    type={showPassword ? 'text' : 'password'}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="pl-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onMouseEnter={() => setShowPassword(true)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    className="hover:bg-accent absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                                >
                                    <Eye className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                                </Button>
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={resetPasswordForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="reset-password-confirm-password">
                                {t('confirmPassword')}
                            </FieldLabel>
                            <div className="relative">
                                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="signup-confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    aria-invalid={fieldState.invalid}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="pl-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onMouseEnter={() =>
                                        setShowConfirmPassword(true)
                                    }
                                    onMouseLeave={() =>
                                        setShowConfirmPassword(false)
                                    }
                                    className="hover:bg-accent absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                                >
                                    <Eye className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                                </Button>
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>
            {hasError && (
                <p className="text-muted-foreground text-center text-sm">
                    {t('somethingWentWrong')}
                </p>
            )}
            <Field orientation="horizontal">
                <Button
                    type="submit"
                    form="reset-password-rhf"
                    className="w-full"
                    disabled={isPending}
                >
                    {t('resetPassword')}
                </Button>
            </Field>
        </form>
    );
}
