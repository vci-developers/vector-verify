import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toDomId } from "@/lib/id-utils";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface MorphIdDropdownMenuProps {
  label: string;
  morphIds: readonly string[];
  selectedMorphId: string | undefined;
  onMorphIdSelected: (morphId?: string) => void;
  enabled?: boolean;
}

export default function MorphIdDropdownMenu({
  label,
  morphIds,
  selectedMorphId,
  onMorphIdSelected,
  enabled = true,
}: MorphIdDropdownMenuProps) {
  function morphIdSelectedHandler(morphId?: string) {
    onMorphIdSelected(morphId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={toDomId(label)}
          variant="outline"
          className={cn(
            "w-full justify-between",
            !enabled && "cursor-not-allowed opacity-50"
          )}
          disabled={!enabled}
        >
          {enabled ? (
            selectedMorphId ? (
              <span>{selectedMorphId}</span>
            ) : (
              <span className="text-muted-foreground">Select {label}...</span>
            )
          ) : (
            <span className="text-muted-foreground">Not Applicable</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {morphIds.map((morphId) => (
          <DropdownMenuItem
            key={morphId}
            onSelect={() => morphIdSelectedHandler(morphId)}
          >
            {morphId}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={selectedMorphId === undefined}
          onSelect={() => onMorphIdSelected(undefined)}
          className={cn(
            "text-destructive focus:text-destructive focus:bg-destructive/10",
            selectedMorphId === undefined && "opacity-50 cursor-not-allowed"
          )}
        >
          Clear selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
