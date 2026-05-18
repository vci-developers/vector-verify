'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { VillageIrsFormData } from '../utils/build-site-irs-data';

export const INSECTICIDE_OPTIONS = [
    'Actellic 300C',
    'Sumishield',
    'Flodora Fusion',
    'Bendio Carb',
    'Alpha Cyhalothrin (Fendona)',
    'Icon Labdacyhalothrin',
    'DDT',
    'Pirimiphosmethyl',
    'Clothiacid',
] as const;

interface SiteIrsRowProps {
    entry: VillageIrsFormData;
    formKey: string;
    onUpdate: (key: string, patch: Partial<VillageIrsFormData>) => void;
}

export default function SiteIrsRow({
    entry,
    formKey,
    onUpdate,
}: SiteIrsRowProps) {
    return (
        <div className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={formKey}
                    checked={entry.wasIrsSprayed}
                    onChange={event =>
                        onUpdate(formKey, {
                            wasIrsSprayed: event.target.checked,
                            insecticideSprayed: '',
                            dateLastSprayed: '',
                        })
                    }
                    className="h-4 w-4 cursor-pointer"
                />
                <Label htmlFor={formKey} className="font-medium">
                    {entry.villageName}
                </Label>
            </div>

            {entry.wasIrsSprayed && (
                <div className="ml-6 space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor={`insecticide-${formKey}`}>
                            Insecticide sprayed
                        </Label>
                        <Select
                            value={entry.insecticideSprayed}
                            onValueChange={value =>
                                onUpdate(formKey, { insecticideSprayed: value })
                            }
                        >
                            <SelectTrigger id={`insecticide-${formKey}`}>
                                <SelectValue placeholder="Select an insecticide" />
                            </SelectTrigger>
                            <SelectContent>
                                {INSECTICIDE_OPTIONS.map(opt => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`date-${formKey}`}>
                            Date last sprayed
                        </Label>
                        <Input
                            id={`date-${formKey}`}
                            type="date"
                            value={entry.dateLastSprayed}
                            onChange={event =>
                                onUpdate(formKey, {
                                    dateLastSprayed: event.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
