import React from 'react';

import { Label } from '@/components/ui/label';

type SpecimenMetadataProps = {
  location?: string;
  collectionMethod?: string;
  collectionDate?: Date | string | number;
  condition?: string;
};

export function SpecimenMetadata({
  location = 'Unknown',
  collectionMethod = 'Unknown',
  collectionDate,
  condition = 'Unknown',
}: SpecimenMetadataProps) {
  const formattedDate = collectionDate ? new Date(collectionDate).toLocaleDateString() : 'Unknown';

  return (
    <div className="grid grid-cols-2 gap-y-9 px-3 w-full text-sm">
      <div>
        <Label className="text-sm text-muted-foreground">Location:</Label>
        <p>{location}</p>
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Collection Method:</Label>
        <p>{collectionMethod}</p>
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Collection Date:</Label>
        <p>{formattedDate}</p>
      </div>
      <div>
        <Label className="text-sm text-muted-foreground">Specimen Condition:</Label>
        <p>{condition}</p>
      </div>
    </div>
  );
}
