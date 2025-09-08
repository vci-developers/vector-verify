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

