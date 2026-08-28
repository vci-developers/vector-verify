'use client';

import { Controller, useForm } from 'react-hook-form';
import {
    forgotPasswordFormSchema,
    type ForgotPasswordFormInput,
} from '@/features/auth/validation/forgot-password-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { usePostForgotPassword } from '@/api/auth/hooks/use-post-forgot-password';
import { useTranslations } from 'next-intl';
import { useResendCooldown } from '@/lib/hooks/use-resend-cooldown';

export default function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const { secondsRemaining, isOnCooldown, startCooldown } =
        useResendCooldown('forgotPassword');
    const { mutate: postForgotPassword, isPending } = usePostForgotPassword();
    const t = useTranslations('Auth');

    const forgotPasswordForm = useForm<ForgotPasswordFormInput>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(data: ForgotPasswordFormInput) {
        setSubmitted(false);
        setHasError(false);
        postForgotPassword(data, {
            onSuccess: result => {
                if (result.ok) {
                    setSubmitted(true);
                    startCooldown();
                } else {
                    setHasError(true);
                }
            },
            onError: () => setHasError(true),
        });
    }

    return (
        <form
            id="forgot-password-rhf"
            onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <FieldGroup>
                <Controller
                    name="email"
                    control={forgotPasswordForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="reset-password-rhf-email">
                                {t('email')}
                            </FieldLabel>
                            <div className="relative">
                                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="forgot-password-rhf-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="name@example.com"
                                    autoComplete="off"
                                    className="pl-10"
                                />
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>
            <Field orientation="horizontal">
                <Button
                    type="submit"
                    form="forgot-password-rhf"
                    className="w-full"
                    disabled={isPending || isOnCooldown}
                >
                    {isPending
                        ? t('forgotPasswordLoadingMessage')
                        : isOnCooldown
                          ? t('forgotPasswordCooldownMessage', {
                                time: secondsRemaining,
                            })
                          : hasError || submitted
                            ? t('forgotPasswordResendMessage')
                            : t('sendResetLink')}
                </Button>
            </Field>
            {submitted && (
                <p className="text-muted-foreground text-center text-sm">
                    {t('forgotPasswordSuccessMessage')}
                </p>
            )}
            {hasError && (
                <p className="text-muted-foreground text-center text-sm">
                    {t('somethingWentWrong')}
                </p>
            )}
        </form>
    );
}
