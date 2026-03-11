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
import type { SignupSuccessPayload } from '@/features/auth/validation/network/signup-network-schema';
import {
    signupFormSchema,
    type SignupFormInput,
} from '@/features/auth/validation/form/signup-form-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useRouter } from 'next/navigation';
import { Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import type { Program } from '@/api/program/validation/program-schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SignupFormProps {
    programs: Program[];
}

export default function SignupForm({ programs }: SignupFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const signupForm = useForm<SignupFormInput>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: '',
            name: '',
            programId: '',
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: SignupFormInput) {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                ...data,
                programId: parseInt(data.programId),
            }),
        });

        const signupResult: Result<SignupSuccessPayload, NetworkError> =
            await response.json();

        if (!response.ok || !signupResult.ok) {
            console.error('Signup failed', signupResult);
            return;
        }

        router.replace('/');
        router.refresh();
    }

    return (
        <form
            id="signup-rhf"
            onSubmit={signupForm.handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <FieldGroup>
                <Controller
                    name="email"
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-email">
                                Email
                            </FieldLabel>
                            <div className="relative">
                                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="signup-email"
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
                <div className="flex gap-4">
                    <Controller
                        name="name"
                        control={signupForm.control}
                        render={({ field, fieldState }) => (
                            <Field
                                className="flex-1"
                                data-invalid={fieldState.invalid}
                            >
                                <FieldLabel htmlFor="signup-name">
                                    Name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="signup-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Your name here"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="programId"
                        control={signupForm.control}
                        render={({ field, fieldState }) => (
                            <Field
                                className="min-w-0 flex-1"
                                data-invalid={fieldState.invalid}
                            >
                                <FieldLabel htmlFor="signup-program">
                                    Program
                                </FieldLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        id="signup-program"
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map(program => (
                                            <SelectItem
                                                key={program.programId}
                                                value={String(
                                                    program.programId,
                                                )}
                                            >
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    name="password"
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-password">
                                Password
                            </FieldLabel>
                            <div className="relative">
                                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    {...field}
                                    id="signup-password"
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
                    control={signupForm.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="signup-confirm-password">
                                Confirm Password
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
            <Field orientation="horizontal">
                <Button
                    type="submit"
                    form="signup-rhf"
                    className="w-full"
                    disabled={signupForm.formState.isSubmitting}
                >
                    Create Account
                </Button>
            </Field>
        </form>
    );
}
