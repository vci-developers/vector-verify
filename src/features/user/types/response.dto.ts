import type { UserDto, UserPermissionsDto } from '@/lib/entities/user';

export interface UserProfileResponseDto {
  message: string;
  user: UserDto;
}

export interface UserPermissionsResponseDto {
  message: string;
  permissions: UserPermissionsDto;
}
