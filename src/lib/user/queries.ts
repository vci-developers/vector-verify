import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from './api';

export function useUserProfileQuery() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: getUserProfile,
    staleTime: 60 * 1000,
  });
}

