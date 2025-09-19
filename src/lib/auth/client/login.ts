'use client';

import { signIn, type SignInResponse } from 'next-auth/react';
import type { LoginRequestDto } from '@/lib/entities/auth/dto';

export async function loginWithCredentials(
  input: LoginRequestDto,
): Promise<SignInResponse | undefined> {
  return await signIn('credentials', {
    email: input.email,
    password: input.password,
    redirect: false,
  });
}
