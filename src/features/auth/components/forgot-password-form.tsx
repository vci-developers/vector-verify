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

export default function ForgotPasswordForm() {
    const [sentEmail, setSentEmail] = useState(false);

    const forgotPasswordForm = useForm<ForgotPasswordFormInput>({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(data: ForgotPasswordFormInput) {
        // TODO: API call + handling here
        // Display the email sent message
        setSentEmail(true);
    }

    // Not sure if there should be some resend button
    if (sentEmail) {
        return (
            <p className="text-muted-foreground text-center text-sm">
                Sent! Check your email for the password reset link.
            </p>
        );
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
                                Email
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
                    disabled={forgotPasswordForm.formState.isSubmitting}
                >
                    Send Email
                </Button>
            </Field>
        </form>
    );
}
