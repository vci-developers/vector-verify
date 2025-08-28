'use client';

import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type AnnotationTaskWithEntriesDto } from '@/lib/data/dto/composites/annotation-task-with-entries-dto';
import { formatDate } from '@/lib/date-utils';

import { type AnnotationFormOutput } from '../validation/annotation-form-schema';
import AnnotationForm from './annotation-panel/annotation-form/annotation-form';
import { AnnotationNavigator } from './annotation-panel/annotation-navigator/annotation-navigator';
import AnnotationStatus from './annotation-panel/annotation-status/annotation-status';
import { SpecimenImageViewer } from './specimen-panel/specimen-image-viewer';
import { SpecimenMetadata } from './specimen-panel/specimen-metadata';

type AnnotationTaskClientProps = {
  taskWithEntries: AnnotationTaskWithEntriesDto;
};

export function AnnotationTaskClient({ taskWithEntries }: AnnotationTaskClientProps) {
  const [currentSpecimenImageIndex, setCurrentSpecimenImageIndex] = useState(0);

  const { monthYear } = formatDate(taskWithEntries.createdAt);

  const totalEntries = taskWithEntries.entries.length ?? 0;
  const currentEntry =
    totalEntries > 0
      ? taskWithEntries.entries[Math.min(currentSpecimenImageIndex, totalEntries - 1)]
      : undefined;

  const { annotatedCount, flaggedCount, pendingCount, completedPercent } = useMemo(() => {
    let annotatedCount = 0;
    let flaggedCount = 0;
    let pendingCount = 0;

    for (const entry of taskWithEntries.entries ?? []) {
      const s = entry.annotation.status;
      if (s === 'ANNOTATED') annotatedCount++;
      else if (s === 'FLAGGED') flaggedCount++;
      else pendingCount++;
    }

    const total = annotatedCount + flaggedCount + pendingCount;
    const completedPercent =
      total === 0 ? 0 : Math.round(((annotatedCount + flaggedCount) / total) * 100);

    return { annotatedCount, flaggedCount, pendingCount, completedPercent };
  }, [taskWithEntries.entries]);

  const handleAnnotationFormSubmit = async (formOutput: AnnotationFormOutput) => {
    console.log('Saving annotation data:', {
      annotationId: currentEntry?.annotation.id,
      specimenNumericId: currentEntry?.specimen.id,
      specimenPublicId: currentEntry?.specimen.specimenId,
      ...formOutput,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {/* Left: Specimen */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="py-1.5 px-6 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium">
              {totalEntries > 0
                ? `${Math.min(currentSpecimenImageIndex, totalEntries - 1) + 1} of ${totalEntries}`
                : 'No specimens'}
            </h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{monthYear}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {currentEntry?.specimen.specimenId ?? 'Unknown'}
          </p>
        </CardHeader>

        <CardContent className="p-2 px-6 pt-0.5 pb-0.5">
          <SpecimenImageViewer imageUrl={currentEntry?.specimen.thumbnailUrl} />
        </CardContent>

        <CardFooter className="border-t py-0.5 px-4">
          <SpecimenMetadata
            location={currentEntry?.session.houseNumber}
            collectionMethod={currentEntry?.session.collectionMethod}
            collectionDate={currentEntry?.session.collectionDate}
            condition={currentEntry?.session.specimenCondition}
          />
        </CardFooter>
      </Card>

      {/* Right: Annotation */}
      <Card className="w-full max-w-md mx-auto flex flex-col max-h-[calc(100vh-2.5rem)] overflow-hidden">
        <CardHeader className="py-1 px-6 flex-shrink-0">
          <h2 className="text-base font-medium mb-1">Annotation Form</h2>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Specimens annotated</span>
              <span>{completedPercent}% complete</span>
            </div>

            <Progress
              value={completedPercent}
              className="bg-secondary-foreground/10 h-1.5"
              aria-label="annotation progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completedPercent}
            />

            <AnnotationStatus
              annotated={annotatedCount}
              pending={pendingCount}
              flagged={flaggedCount}
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-1 overflow-y-auto flex-grow">
          <AnnotationForm onSubmit={handleAnnotationFormSubmit} />
        </CardContent>

        <CardFooter className="py-0.5 px-4 flex-shrink-0">
          <AnnotationNavigator
            currentSpecimenImageIndex={currentSpecimenImageIndex}
            totalSpecimenImages={totalEntries}
            onSpecimenImageIndexChanged={setCurrentSpecimenImageIndex}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
