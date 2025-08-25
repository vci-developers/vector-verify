import { Button } from "@/components/ui/button";
import { useKeyboardNavigation } from "@/feature/annotate/hooks/useKeyboardNavigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AnnotationNavigatorProps {
  currentSpecimenImageIndex: number;
  totalSpecimenImages: number;
  onSpecimenImageIndexChanged: (newIndex: number) => void;
}

export function AnnotationNavigator({
  currentSpecimenImageIndex,
  totalSpecimenImages,
  onSpecimenImageIndexChanged,
}: AnnotationNavigatorProps) {
  const canNavigatePrevious = currentSpecimenImageIndex > 0;
  const canNavigateNext = currentSpecimenImageIndex < totalSpecimenImages - 1;

  const onNavigatePrevious = () =>
    onSpecimenImageIndexChanged(Math.max(0, currentSpecimenImageIndex - 1));
  const onNavigateNext = () =>
    onSpecimenImageIndexChanged(
      Math.min(totalSpecimenImages - 1, currentSpecimenImageIndex + 1)
    );

  const { activeNavigationDirection } = useKeyboardNavigation(
    canNavigatePrevious,
    canNavigateNext,
    onNavigatePrevious,
    onNavigateNext
  );

  return (
    <div className="flex justify-between w-full items-center">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1",
          activeNavigationDirection === "previous" &&
            "bg-accent text-accent-foreground"
        )}
        onClick={onNavigatePrevious}
        disabled={!canNavigatePrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <p>Use keyboard</p>
        <kbd
          className={cn(
            "bg-muted px-1 py-0.5 rounded",
            activeNavigationDirection === "previous" &&
              "bg-accent text-accent-foreground"
          )}
        >
          ←
        </kbd>
        <kbd
          className={cn(
            "bg-muted px-1 py-0.5 rounded",
            activeNavigationDirection === "next" &&
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
          activeNavigationDirection === "next" &&
            "bg-accent text-accent-foreground"
        )}
        onClick={onNavigateNext}
        disabled={!canNavigateNext}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
