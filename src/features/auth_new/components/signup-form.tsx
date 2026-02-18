'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { SignupNetworkSuccessPayload } from '@/features/auth_new/validation/network/signup-network-schema';
import {
    signupFormSchema,
    type SignupFormInput,
} from '@/features/auth_new/validation/form/signup-form-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
    const router = useRouter();

    const signupForm = useForm<SignupFormInput>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: SignupFormInput) {
        const response = await fetch('/api/auth_new/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const signupResult: Result<SignupNetworkSuccessPayload, NetworkError> =
            await response.json();

        if (!response.ok || !signupResult.ok) {
            console.error('Signup failed');
            return;
        }

        router.replace('/dashboard');
        router.refresh();
    }

    return (
        <form id="signup-rhf" onSubmit={signupForm.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="email"
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-email">
                                Email
                            </FieldLabel>
                            <Input
                                {...field}
                                id="signup-email"
                                aria-invalid={fieldState.invalid}
                                placeholder="name@example.com"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="password"
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-password">
                                Password
                            </FieldLabel>
                            <Input
                                {...field}
                                id="signup-password"
                                type="password"
                                aria-invalid={fieldState.invalid}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="confirmPassword"
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-confirm-password">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                {...field}
                                id="signup-confirm-password"
                                type="password"
                                aria-invalid={fieldState.invalid}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>
            <Field orientation="horizontal">
                <Button type="submit" form="signup-rhf">
                    Create Account
                </Button>
            </Field>
        </form>
    );
}
