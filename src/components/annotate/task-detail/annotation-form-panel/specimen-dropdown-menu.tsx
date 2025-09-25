import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toDomId } from "@/lib/shared/utils/dom";
import { ChevronDown } from "lucide-react";
import { de } from "zod/v4/locales";
import { on } from "events";

interface SpecimenDropdownMenuProps {
    label: string;
    specimenIds: readonly string[];
    selectedSpecimenId: string | undefined;
    onSpecimenSelect: (specimenId?: string) => void;
    enabled?: boolean;
}

export default function SpecimenDropdownMenu({
    label,
    specimenIds,
    selectedSpecimenId,
    onSpecimenSelect,
    enabled = true,
}: SpecimenDropdownMenuProps) {
    function specimenIdSelectHandler(specimenId?: string) {
        onSpecimenSelect(specimenId);
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    id={toDomId(label)}
                    variant="outline"
                    className={cn(
                        "w-full justify-between",
                        !enabled && "pointer-events-none opacity-50"
                    )}
                    disabled={!enabled}
                >
                    {enabled ? (
                        selectedSpecimenId ?(
                            <span> {selectedSpecimenId} </span>
                        ) : (
                            <span className="text-muted-foreground">Select {label}...</span>
                        )
                    ) : (
                        <span className="text-muted-foreground"> Not Applicable </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

        </DropdownMenu>

    )
}



