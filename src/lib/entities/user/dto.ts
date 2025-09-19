import type { UserPermissions } from '@/lib/entities/user/permissions';

export interface UserDto {
  id: number;
  email: string;
  privilege: number;
  isActive: boolean;
  isWhitelisted: boolean;
}

export interface UserProfileResponseDto {
  message: string;
  user: UserDto;
}

export interface UserPermissionsResponseDto {
  message: string;
  permissions: UserPermissions;
}
