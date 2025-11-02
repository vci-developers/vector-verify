'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserProfileQuery, useUserPermissionsQuery } from '@/features/user';
import {
  getAccessibleDistricts,
  normalizeDistrictList,
} from '@/features/review/utils/district-access';

interface UseDistrictManagementProps {
  availableDistricts?: string[];
}

export function useDistrictManagement({
  availableDistricts,
}: UseDistrictManagementProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [persistedAvailableDistricts, setPersistedAvailableDistricts] =
    useState<string[]>([]);

  const { data: user } = useUserProfileQuery();
  const { data: permissions } = useUserPermissionsQuery();

  const normalizedDistrictsFromResponse = useMemo(
    () => normalizeDistrictList(availableDistricts),
    [availableDistricts],
  );

  useEffect(() => {
    if (!normalizedDistrictsFromResponse.length) return;

    setPersistedAvailableDistricts(prevDistricts => {
      const merged = normalizeDistrictList([
        ...prevDistricts,
        ...normalizedDistrictsFromResponse,
      ]);

      const isUnchanged =
        merged.length === prevDistricts.length &&
        merged.every((district, index) => district === prevDistricts[index]);

      return isUnchanged ? prevDistricts : merged;
    });
  }, [normalizedDistrictsFromResponse]);

  const availableDistrictsList = useMemo(() => {
    if (persistedAvailableDistricts.length) return persistedAvailableDistricts;
    return normalizedDistrictsFromResponse;
  }, [persistedAvailableDistricts, normalizedDistrictsFromResponse]);

  const accessibleDistricts = useMemo(() => {
    if (!availableDistrictsList.length) return [] as string[];
    if (!user || !permissions) return availableDistrictsList;
    return getAccessibleDistricts(availableDistrictsList, user, permissions);
  }, [availableDistrictsList, permissions, user]);

  useEffect(() => {
    if (
      selectedDistrict &&
      accessibleDistricts.length > 0 &&
      !accessibleDistricts.includes(selectedDistrict)
    ) {
      setSelectedDistrict(null);
    }
  }, [accessibleDistricts, selectedDistrict]);

  const handleDistrictSelected = (district: string | null) => {
    setSelectedDistrict(district);
  };

  return {
    selectedDistrict,
    accessibleDistricts,
    handleDistrictSelected,
  };
}
