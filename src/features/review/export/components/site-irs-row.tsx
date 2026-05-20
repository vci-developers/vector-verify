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
import type { SiteIrsFormData } from '@/features/review/export/utils/build-site-irs-data';

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
    entry: SiteIrsFormData;
    onUpdate: (patch: Partial<SiteIrsFormData>) => void;
}

export default function SiteIrsRow({ entry, onUpdate }: SiteIrsRowProps) {
    return (
        <div className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`irs-${entry.siteId}`}
                    checked={entry.wasIrsSprayed}
                    onChange={event =>
                        onUpdate({
                            wasIrsSprayed: event.target.checked,
                            insecticideSprayed: '',
                            dateLastSprayed: '',
                        })
                    }
                    className="h-4 w-4 cursor-pointer"
                />
                <Label htmlFor={`irs-${entry.siteId}`} className="font-medium">
                    Was IRS sprayed?
                </Label>
            </div>

            {entry.wasIrsSprayed && (
                <div className="ml-6 space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor={`insecticide-${entry.siteId}`}>
                            Insecticide sprayed
                        </Label>
                        <Select
                            value={entry.insecticideSprayed}
                            onValueChange={value =>
                                onUpdate({ insecticideSprayed: value })
                            }
                        >
                            <SelectTrigger id={`insecticide-${entry.siteId}`}>
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
                        <Label htmlFor={`date-${entry.siteId}`}>
                            Date last sprayed
                        </Label>
                        <Input
                            id={`date-${entry.siteId}`}
                            type="date"
                            value={entry.dateLastSprayed}
                            onChange={event =>
                                onUpdate({
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
