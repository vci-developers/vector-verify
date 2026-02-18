"use client";

import { useForm } from 'react-hook-form';
import {
    signupFormSchema,
    type SignupFormInput,
} from '@/features/auth_new/validation/form/signup-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';

export default function SignupForm() {
    const signupForm = useForm<SignupFormInput>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    function onSubmit(data: SignupFormInput) {}

    return <form onSubmit={signupForm.handleSubmit(onSubmit)}></form>;
}
