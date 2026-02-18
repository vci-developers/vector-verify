'use client';

import { Controller, useForm } from 'react-hook-form';
import {
    loginFormSchema,
    type LoginFormInput,
} from '@/features/auth_new/validation/form/login-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import type { LoginNetworkResponseBody } from '@/features/auth_new/validation/network/login-network-schema';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();

    const loginForm = useForm<LoginFormInput>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: LoginFormInput) {
        const response = await fetch('/api/auth_new/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const loginResult: Result<LoginNetworkResponseBody, NetworkError> =
            await response.json();
        if (!response.ok || !loginResult.ok) {
            console.error('Login Failed');
            return;
        }

        router.replace('/dashboard');
        router.refresh();
    }

    return (
        <form id="login-rhf" onSubmit={loginForm.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="email"
                    control={loginForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-rhf-email">
                                Email
                            </FieldLabel>
                            <Input
                                {...field}
                                id="login-rhf-email"
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
                    control={loginForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-rhf-password">
                                Password
                            </FieldLabel>
                            <Input
                                {...field}
                                id="login-rhf-password"
                                aria-invalid={fieldState.invalid}
                                placeholder="••••••••"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>
            <Field orientation="horizontal">
                <Button type="submit" form="login-rhf">
                    Submit
                </Button>
            </Field>
        </form>
    );
}
