"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { AnnotationFormOutput } from "../validation/annotation-form-schema";
import AnnotationForm from "./annotation-panel/annotation-form/annotation-form";
import { AnnotationNavigator } from "./annotation-panel/annotation-navigator/annotation-navigator";
import AnnotationStatus from "./annotation-panel/annotation-status/annotation-status";
import { SpecimenImageViewer } from "./specimen-panel/specimen-image-viewer";
import { SpecimenMetadata } from "./specimen-panel/specimen-metadata";
import { getProgressStats } from "@/lib/image-utils";
import { Progress } from "@/components/ui/progress";

interface AnnotationTaskClientProps {
  task: any; // TODO: CHANGE AFTER DEFINING ACTUAL MODEL
}

export function AnnotationTaskClient({ task }: AnnotationTaskClientProps) {
  const [currentSpecimenImageIndex, setCurrentSpecimenImageIndex] = useState(0);

  const { monthYear } = formatDate(task.timestamp);

  const totalSpecimenImages = task.images?.length ?? 0;
  const currentSpecimen = task.images?.[currentSpecimenImageIndex];
  const { completedPercent, annotated, flagged, unannotated } =
    getProgressStats(task.images);
    
  const handleAnnotationFormSubmit = async (
    formOutput: AnnotationFormOutput
  ) => {
    console.log("Saving annotation data:", {
      specimenId: currentSpecimen?.specimenId,
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
              {totalSpecimenImages > 0
                ? `Specimen ${
                    currentSpecimenImageIndex + 1
                  } of ${totalSpecimenImages}`
                : "No specimens"}
            </h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{monthYear}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {currentSpecimen?.specimenId ?? "Unknown"}
          </p>
        </CardHeader>

        <CardContent className="p-2 px-6 pt-0.5 pb-0.5">
          <SpecimenImageViewer imageUrl={currentSpecimen?.imageUrl} />
        </CardContent>

        <CardFooter className="border-t py-0.5 px-4">
          <SpecimenMetadata
            location={task?.district}
            collectionMethod={currentSpecimen?.specimenId}
            collectionDate={task?.timestamp}
            condition={task?.status}
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
              annotated={annotated}
              pending={unannotated}
              flagged={flagged}
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-1 overflow-y-auto flex-grow">
          <AnnotationForm onSubmit={handleAnnotationFormSubmit} />
        </CardContent>

        <CardFooter className="py-0.5 px-4 flex-shrink-0">
          <AnnotationNavigator
            currentSpecimenImageIndex={currentSpecimenImageIndex}
            totalSpecimenImages={totalSpecimenImages}
            onSpecimenImageIndexChanged={setCurrentSpecimenImageIndex}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
