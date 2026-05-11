'use client';

import { Controller, useForm } from 'react-hook-form';
import {
    loginFormSchema,
    type LoginFormInput,
} from '@/features/auth/validation/login-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import type { LoginSuccessPayload } from '@/api/auth/validation/login-schema';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const loginForm = useForm<LoginFormInput>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: LoginFormInput) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const loginResult: Result<LoginSuccessPayload, NetworkError> =
            await response.json();

        if (!response.ok || !loginResult.ok) {
            console.error('Login Failed');
            return;
        }

        router.replace('/');
        router.refresh();
    }

    return (
        <form
            id="login-rhf"
            onSubmit={loginForm.handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <FieldGroup>
                <Controller
                    name="email"
                    control={loginForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-rhf-email">
                                Email
                            </FieldLabel>
                            <div className="relative">
                                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="login-rhf-email"
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
                <Controller
                    name="password"
                    control={loginForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-rhf-password">
                                Password
                            </FieldLabel>
                            <div className="relative">
                                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="login-rhf-password"
                                    type={showPassword ? 'text' : 'password'}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="••••••••"
                                    autoComplete="off"
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
            </FieldGroup>
            <Field orientation="horizontal">
                <Button
                    type="submit"
                    form="login-rhf"
                    className="w-full"
                    disabled={loginForm.formState.isSubmitting}
                >
                    Login
                </Button>
            </Field>
        </form>
    );
}
