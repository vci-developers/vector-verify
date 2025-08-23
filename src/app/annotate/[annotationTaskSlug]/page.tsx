"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { SpecimenMetadata } from "@/features/annotate/components/SpecimenMetadata";
import { useImageZoom } from "@/features/annotate/hooks/useImageZoom";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-annotation-tasks";
import { getProgressStats } from "@/lib/image-utils";
import {
  ABDOMEN_STATUS_LABELS,
  SEX_LABELS,
  SPECIES_LABELS,
} from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  Flag,
  ImageIcon,
  RotateCcw,
  Save,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";

interface AnnotationPageProps {
  params: Promise<{ annotationTaskSlug: string }>;
}

export default function AnnotationPage({ params }: AnnotationPageProps) {
  const { annotationTaskSlug } = use(params);
  const task = DUMMY_ANNOTATION_TASKS.find(
    (t) => t.id === parseInt(annotationTaskSlug)
  );

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedSex, setSelectedSex] = useState("");
  const [selectedAbdomenStatus, setSelectedAbdomenStatus] = useState("");
  const [isFlagged, setIsFlagged] = useState(false);
  const [notes, setNotes] = useState("");
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

  // Zoom functionality
  const {
    viewerRef,
    zoom,
    offset,
    isDragging,
    startDrag,
    doDrag,
    endDrag,
    adjustZoom,
    resetView,
  } = useImageZoom();

  const cursorClass =
    zoom > 1
      ? isDragging
        ? "cursor-grabbing"
        : "cursor-grab"
      : "cursor-default";
  const imageTransform = {
    transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${
      offset.y / zoom
    }px)`,
    transition: isDragging ? "none" : "transform 0.2s ease-out",
    transformOrigin: "center",
  };

  // Navigation handlers
  const goToPrevious = () =>
    currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const goToNext = () =>
    currentIndex < totalSpecimens - 1 && setCurrentIndex(currentIndex + 1);

  const handleSubmit = () => {
    console.log("Saving annotation data:", {
      specimenId: currentSpecimen?.specimenId,
      species: selectedSpecies,
      sex: selectedSex,
      abdomenStatus: selectedAbdomenStatus,
      isFlagged,
      notes,
    });

    // Reset form
    setSelectedSpecies("");
    setSelectedSex("");
    setSelectedAbdomenStatus("");
    setIsFlagged(false);
    setNotes("");

    // Navigate to next or show completion
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

  // UI components for dropdown selectors
  const renderDropdown = (
    label: string,
    value: string,
    placeholder: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <div>
      <h3 className="text-sm font-medium mb-2">{label}</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {value ? (
              <span>{value}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {options.map((option) => (
            <DropdownMenuItem key={option} onSelect={() => onSelect(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

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
          <div
            ref={viewerRef}
            className={cn(
              "bg-muted/50 rounded-md overflow-hidden select-none h-[380px] w-full",
              cursorClass
            )}
            onMouseDown={startDrag}
            onMouseMove={doDrag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
          >
            {currentSpecimen?.imageUrl ? (
              <div className="relative w-full h-full" style={imageTransform}>
                <Image
                  src={currentSpecimen.imageUrl}
                  alt="Specimen"
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustZoom(0.25)}
            >
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustZoom(-0.25)}
            >
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
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
              aria-valuenow={completedPercent}
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-1 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {/* Status breakdown */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium">Status Breakdown</h3>
              <div className="grid grid-cols-3 gap-2">
                <StatusCard
                  icon={<FileCheck className="h-4 w-4 text-primary" />}
                  color="primary"
                  label="Completed"
                  count={annotated}
                />
                <StatusCard
                  icon={<Clock className="h-4 w-4 text-amber-500" />}
                  color="amber-500"
                  label="Pending"
                  count={unannotated}
                />
                <StatusCard
                  icon={<AlertCircle className="h-4 w-4 text-destructive" />}
                  color="destructive"
                  label="Flagged"
                  count={flagged}
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="space-y-2.5">
              {renderDropdown(
                "Species",
                selectedSpecies,
                "Select species...",
                SPECIES_LABELS,
                setSelectedSpecies
              )}

              {renderDropdown(
                "Sex",
                selectedSex,
                "Select sex...",
                SEX_LABELS,
                setSelectedSex
              )}

              {renderDropdown(
                "Abdomen Status",
                selectedAbdomenStatus,
                "Select abdomen status...",
                ABDOMEN_STATUS_LABELS,
                setSelectedAbdomenStatus
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-medium mb-1.5">Notes</h3>
              <Textarea
                placeholder="Add observations..."
                className="min-h-[80px] resize-none text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={isFlagged}
                onPressedChange={setIsFlagged}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md border transition-colors",
                  "data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/30 motion-safe:data-[state=on]:animate-pulse",
                  "data-[state=off]:bg-background data-[state=off]:border-input data-[state=off]:hover:bg-accent"
                )}
              >
                <Flag
                  className={cn(
                    "h-4 w-4",
                    isFlagged && "text-destructive fill-current"
                  )}
                />
                <span>{isFlagged ? "Remove Flag" : "Flag"}</span>
              </Toggle>

              <Button
                variant="default"
                className="flex items-center justify-center gap-1.5"
                onClick={handleSubmit}
              >
                <Save className="h-4 w-4" />
                Submit
              </Button>
            </div>
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
