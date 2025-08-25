"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AnnotationForm from "@/feature/annotate/components/annotation-panel/annotation-form/annotation-form";
import { AnnotationNavigator } from "@/feature/annotate/components/annotation-panel/annotation-navigator/annotation-navigator";
import AnnotationStatus from "@/feature/annotate/components/annotation-panel/annotation-status/annotation-status";
import { SpecimenImageViewer } from "@/feature/annotate/components/specimen-panel/specimen-image-viewer";
import { SpecimenMetadata } from "@/feature/annotate/components/specimen-panel/specimen-metadata";
import { AnnotationFormOutput } from "@/feature/annotate/validation/annotation-form-schema";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-annotation-tasks";
import { getProgressStats } from "@/lib/image-utils";
import { Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function AnnotationPage() {
  const { annotationTaskSlug } = useParams<{ annotationTaskSlug: string }>();
  const taskId = Number(annotationTaskSlug);

  const task = DUMMY_ANNOTATION_TASKS.find((t) => t.id === taskId);

  // State
  const [currentSpecimenImageIndex, setCurrentSpecimenImageIndex] = useState(0);

  // Derived data
  const totalSpecimenImages = task?.images?.length ?? 0;
  const currentSpecimen = task?.images?.[currentSpecimenImageIndex];
  const formattedDate = task?.timestamp
    ? new Date(task.timestamp).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown Date";

  const { completedPercent, annotated, flagged, unannotated } = task
    ? getProgressStats(task.images)
    : { completedPercent: 0, annotated: 0, flagged: 0, unannotated: 0 };

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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="py-1.5 px-6 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium">
              Specimen {currentSpecimenImageIndex + 1} of {totalSpecimenImages}
            </h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {currentSpecimen?.specimenId || "Unknown"}
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
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-1 overflow-y-auto flex-grow">
          <div className="space-y-3">
            <AnnotationStatus
              annotated={annotated}
              pending={unannotated}
              flagged={flagged}
            />

            <AnnotationForm onSubmit={handleAnnotationFormSubmit} />
          </div>
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
