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
import { Checkbox } from '@/components/ui/checkbox';

const INSECTICIDE_OPTIONS = [
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
    siteId: number;
    wasIrsSprayed: boolean;
    insecticideSprayed: string;
    dateLastSprayed: string;
    onChange: (nextForm: {
        wasIrsSprayed: boolean;
        insecticideSprayed: string;
        dateLastSprayed: string;
    }) => void;
}

export default function SiteIrsRow({
    siteId,
    wasIrsSprayed,
    insecticideSprayed,
    dateLastSprayed,
    onChange,
}: SiteIrsRowProps) {
    return (
        <div className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
                <Checkbox
                    id={`irs-${siteId}`}
                    checked={wasIrsSprayed}
                    onCheckedChange={checked =>
                        onChange({
                            wasIrsSprayed: checked === true,
                            insecticideSprayed: '',
                            dateLastSprayed: '',
                        })
                    }
                />
                <Label htmlFor={`irs-${siteId}`} className="font-medium">
                    Was IRS sprayed?
                </Label>
            </div>

            {wasIrsSprayed && (
                <div className="ml-6 space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor={`insecticide-${siteId}`}>
                            Insecticide sprayed
                        </Label>
                        <Select
                            value={insecticideSprayed}
                            onValueChange={value =>
                                onChange({
                                    wasIrsSprayed,
                                    insecticideSprayed: value,
                                    dateLastSprayed,
                                })
                            }
                        >
                            <SelectTrigger id={`insecticide-${siteId}`}>
                                <SelectValue placeholder="Select an insecticide" />
                            </SelectTrigger>
                            <SelectContent>
                                {INSECTICIDE_OPTIONS.map(insecticide => (
                                    <SelectItem
                                        key={insecticide}
                                        value={insecticide}
                                    >
                                        {insecticide}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`date-${siteId}`}>
                            Date last sprayed
                        </Label>
                        <Input
                            id={`date-${siteId}`}
                            type="date"
                            value={dateLastSprayed}
                            onChange={event =>
                                onChange({
                                    wasIrsSprayed,
                                    insecticideSprayed,
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
