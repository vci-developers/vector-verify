import type { UserDto, UserPermissionsDto } from '@/shared/entities/user';

export interface UserProfileResponseDto {
  message: string;
  user: UserDto;
}

export interface UserPermissionsResponseDto {
  message: string;
  permissions: UserPermissionsDto;
}
