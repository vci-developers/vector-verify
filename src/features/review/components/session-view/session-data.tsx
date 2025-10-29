'use client';

import React, { useMemo } from 'react';
import { useSpecimenCountsQuery } from '@/features/review/hooks/use-specimen-counts';
import {
  SPECIES_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { TableSkeleton } from './loading-skeleton';

const SEX_SORT_ORDER = [
  'Male',
  'Female Unfed',
  'Female Fully-fed',
  'Female Gravid',
];

interface SessionDataTableProps {
  district: string;
  sessionId: string;
  monthYear: string;
}

export function SessionDataTable({
  district,
  sessionId,
  monthYear,
}: SessionDataTableProps) {
  const { data: specimenCounts, isLoading } = useSpecimenCountsQuery({
    district,
    sessionId,
    monthYear, 
  });

  const allSpecies = useMemo(
    () => Object.values(SPECIES_MORPH_IDS),
    []
  );

  const countsBySpeciesAndSex = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    allSpecies.forEach(species => {
      result[species] = {};
      if (species !== 'Non-Mosquito') {
        SEX_SORT_ORDER.forEach(sex => {
          result[species][sex] = 0;
        });
      } else {
        result[species]['total'] = 0;
      }
    });
    if (specimenCounts?.data) {
      specimenCounts.data.forEach(site => {
        (site.counts ?? []).forEach(count => {
          const speciesKey = count.species ?? 'Unknown';
          if (speciesKey === 'Non-Mosquito') {
            result[speciesKey]['total'] += count.count || 0;
          } else if (count.sex === 'Male') {
            result[speciesKey]['Male'] += count.count || 0;
          } else {
            switch (count.abdomenStatus) {
              case 'Unfed':
                result[speciesKey]['Female Unfed'] += count.count || 0;
                break;
              case 'Fully Fed':
              case 'Fully fed':
                result[speciesKey]['Female Fully-fed'] += count.count || 0;
                break;
              case 'Gravid':
                result[speciesKey]['Female Gravid'] += count.count || 0;
                break;
              default:
                break;
            }
          }
        });
      });
    }
    return result;
  }, [specimenCounts, allSpecies]);

  const totalSpecimens = allSpecies.reduce((sum, species) => {
    if (species === 'Non-Mosquito') {
      return sum + (countsBySpeciesAndSex[species]?.['total'] || 0);
    }
    return sum + SEX_SORT_ORDER.reduce(
      (sexSum, sex) => sexSum + (countsBySpeciesAndSex[species]?.[sex] || 0),
      0
    );
  }, 0);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-background w-full overflow-auto rounded-xl border shadow-sm">
      <Table className="text-sm min-w-[640px]">
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="bg-muted border-border sticky left-0 z-30 max-w-[10rem] border-r px-3 text-xs uppercase">
              Sex/Abdomen Status
            </TableHead>
            {allSpecies.map(species => (
              <TableHead
                key={species}
                className="bg-muted text-center text-xs uppercase"
              >
                {species}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {SEX_SORT_ORDER.map(sex => (
            <TableRow key={sex}>
              <TableCell className="bg-background border-border sticky left-0 z-20 max-w-[10rem] border-r align-top font-semibold">
                {sex}
              </TableCell>
              {allSpecies.map(species =>
                species === 'Non-Mosquito' ? (
                  <TableCell key={species} className="bg-background text-center tabular-nums" />
                ) : (
                  <TableCell key={species} className="bg-background text-center tabular-nums">
                    {countsBySpeciesAndSex[species]?.[sex]
                      ? countsBySpeciesAndSex[species][sex].toLocaleString()
                      : '0'}
                  </TableCell>
                )
              )}
            </TableRow>
          ))}
          {/* Total row for each species */}
          <TableRow>
            <TableCell className="bg-background border-border sticky left-0 z-20 max-w-[10rem] border-r align-top font-semibold">
              Total
            </TableCell>
            {allSpecies.map(species => {
              // Sum all counts for this species (including 'total' for Non-Mosquito)
              const total = species === 'Non-Mosquito'
                ? countsBySpeciesAndSex[species]?.['total'] || 0
                : SEX_SORT_ORDER.reduce(
                    (sum, sex) => sum + (countsBySpeciesAndSex[species]?.[sex] || 0),
                    0
                  );
              return (
                <TableCell key={species} className="bg-background text-center tabular-nums font-semibold">
                  {total ? total.toLocaleString() : '0'}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}