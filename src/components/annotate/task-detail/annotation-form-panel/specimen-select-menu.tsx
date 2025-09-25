import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectSeparator } from '@/components/ui/select'; // or SelectSeparator if it exists
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toDomId } from '@/lib/shared/utils/dom';


interface SpecimenSelectMenuProps {
    label: string;
    specimenIds: readonly string[];
    selectedSpecimenId: string | undefined;
    onSpecimenSelect: (specimenId?: string) => void;
}

export default function SpecimenSelectMenu({
    label,
    specimenIds,
    selectedSpecimenId,
    onSpecimenSelect,
}: SpecimenSelectMenuProps) {
    return (
        <Select 
            value={selectedSpecimenId || ""} 
            onValueChange={(value) => onSpecimenSelect(value === "clear" ? undefined : value)}
        >
            <SelectTrigger className="w-full" id={toDomId(label)}>
                <SelectValue
                    placeholder={`Select ${label}...`}
                >
                    {selectedSpecimenId ? (
                        <span> {selectedSpecimenId} </span>
                    ) : (
                        <span className="text-muted-foreground">Select {label}...</span>
                    )}

                </SelectValue>

            </SelectTrigger>
            <SelectContent
                align="start"
                className="w-full max-h-60 overflow-y-auto"
            >
                {specimenIds.map((specimenId) => (
                    <SelectItem
                        key={specimenId}
                        value={specimenId}
                    >
                        {specimenId}
                    </SelectItem>
                ))}

                <SelectSeparator />
                <SelectItem
                    value="clear"
                    disabled={selectedSpecimenId === undefined}
                    className={cn(
                        "text-red-600 hover:bg-red-600/10 focus:bg-red-600/10",
                        selectedSpecimenId === undefined && "pointer-events-none opacity-50"
                    )}
                >
                    Remove selection
                </SelectItem>
            </SelectContent>
        </Select>

    )
}



