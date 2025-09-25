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
                >
                    {selectedSpecimenId ?(
                        <span> {selectedSpecimenId} </span>
                    ) : (
                        <span className="text-muted-foreground">Select {label}...</span>
                    )}

                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className = "w-full max-h-60 overflow-y-auto"
            >
                {specimenIds.map((specimenId) => (
                    <DropdownMenuItem
                        key={specimenId}
                        onSelect={() => specimenIdSelectHandler(specimenId)}
                    >
                        {specimenId}
                    </DropdownMenuItem>

                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={selectedSpecimenId === undefined}
                    onSelect={() => specimenIdSelectHandler(undefined)}
                    className={cn(
                        "text-red-600 hover:bg-red-600/10 focus:bg-red-600/10",
                        selectedSpecimenId === undefined && "pointer-events-none opacity-50"
                    )}
                >
                    Remove selection
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}



