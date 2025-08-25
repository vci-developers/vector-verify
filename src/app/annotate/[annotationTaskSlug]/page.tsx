"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AnnotationForm from "@/feature/annotate/components/annotation-panel/annotation-form/annotation-form";
import AnnotationStatus from "@/feature/annotate/components/annotation-panel/annotation-status/annotation-status";
import { SpecimenMetadata } from "@/feature/annotate/components/specimen-panel/specimen-metadata";
import { SpecimenImageViewer } from "@/feature/annotate/components/specimen-panel/specimen-image-viewer";
import { AnnotationFormOutput } from "@/feature/annotate/validation/annotation-form-schema";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-annotation-tasks";
import { getProgressStats } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { use, useEffect, useState } from "react";

interface AnnotationPageProps {
  params: Promise<{ annotationTaskSlug: string }>;
}

export default function AnnotationPage({ params }: AnnotationPageProps) {
  const { annotationTaskSlug } = use(params);
  const task = DUMMY_ANNOTATION_TASKS.find(
    (t) => t.id === parseInt(annotationTaskSlug, 10)
  );

  // State
  const [currentIndex, setCurrentIndex] = useState(0);

  const [activeNavButton, setActiveNavButton] = useState<
    "left" | "right" | null
  >(null);

  // Derived data
  const totalSpecimens = task?.images?.length || 0;
  const currentSpecimen = task?.images?.[currentIndex];
  const formattedDate = task?.timestamp
    ? new Date(task.timestamp).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown Date";
  const { completedPercent, annotated, flagged, unannotated } = task
    ? getProgressStats(task.images)
    : { completedPercent: 0, annotated: 0, flagged: 0, unannotated: 0 };

  // Navigation handlers
  const goToPrevious = () =>
    currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const goToNext = () =>
    currentIndex < totalSpecimens - 1 && setCurrentIndex(currentIndex + 1);

  const handleAnnotationFormSubmit = async (
    formOutput: AnnotationFormOutput
  ) => {
    console.log("Saving annotation data:", {
      specimenId: currentSpecimen?.specimenId,
      ...formOutput,
    });

    setTimeout(() => {}, 2000);

    if (currentIndex < totalSpecimens - 1) {
      goToNext();
    } else {
      alert("You've completed all specimens in this task!");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setActiveNavButton("left");
        goToPrevious();
      } else if (e.key === "ArrowRight" && currentIndex < totalSpecimens - 1) {
        setActiveNavButton("right");
        goToNext();
      }
    };

    const handleKeyUp = () => setActiveNavButton(null);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentIndex, totalSpecimens]);

  // Status card component
  const StatusCard = ({
    icon,
    color,
    label,
    count,
  }: {
    icon: React.ReactNode;
    color: string;
    label: string;
    count: number;
  }) => (
    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
      <div className={`bg-${color}/20 p-1.5 rounded-md`}>{icon}</div>
      <div className="text-center w-full">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{count}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {/* First card - specimen image and metadata */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="py-1.5 px-6 pb-0">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium">
              Specimen {currentIndex + 1} of {totalSpecimens}
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

      {/* Second card - annotation form with navigation */}
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

        {/* Footer */}
        <CardFooter className="py-0.5 px-4 flex-shrink-0">
          <div className="flex justify-between w-full items-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1",
                activeNavButton === "left" && "bg-accent text-accent-foreground"
              )}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <p>Use keyboard</p>
              <kbd
                className={cn(
                  "bg-muted px-1 py-0.5 rounded",
                  activeNavButton === "left" &&
                    "bg-accent text-accent-foreground"
                )}
              >
                ←
              </kbd>
              <kbd
                className={cn(
                  "bg-muted px-1 py-0.5 rounded",
                  activeNavButton === "right" &&
                    "bg-accent text-accent-foreground"
                )}
              >
                →
              </kbd>
              <p>to navigate</p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1",
                activeNavButton === "right" &&
                  "bg-accent text-accent-foreground"
              )}
              onClick={goToNext}
              disabled={currentIndex === totalSpecimens - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
