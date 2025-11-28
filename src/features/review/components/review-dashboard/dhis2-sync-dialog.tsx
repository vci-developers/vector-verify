'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Checkbox } from '@/ui/checkbox';
import { ScrollArea } from '@/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import type { VillageIrsFormData } from '@/features/review/types/dhis2-sync';

const INSECTICIDE_OPTIONS = [
  'Actellic 300C',
  'Sumishield',
  'Flodora Fusion',
  'Bendio Carb',
  'Alpha Cyhalothrin(Fendona)',
  'Icon Labdacyhalothrin',
  'DDT',
  'Pirimiphosmethyl',
  'Clothiacid',
] as const;

interface Dhis2SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villages: string[];
  onSubmit: (villageData: VillageIrsFormData[]) => void;
  isSubmitting?: boolean;
}

export function Dhis2SyncDialog({
  open,
  onOpenChange,
  villages,
  onSubmit,
  isSubmitting = false,
}: Dhis2SyncDialogProps) {
  const [formData, setFormData] = useState<Map<string, VillageIrsFormData>>(
    () => {
      const initialData = new Map<string, VillageIrsFormData>();
      villages.forEach(village => {
        initialData.set(village, {
          villageName: village,
          wasIrsSprayed: false,
          insecticideSprayed: '',
          dateLastSprayed: '',
        });
      });
      return initialData;
    },
  );

  const handleCheckboxChange = (villageName: string, checked: boolean) => {
    const current = formData.get(villageName);
    if (!current) return;

    const updated = new Map(formData);
    updated.set(villageName, {
      ...current,
      wasIrsSprayed: checked,
      // Clear fields if unchecked
      insecticideSprayed: checked ? current.insecticideSprayed : '',
      dateLastSprayed: checked ? current.dateLastSprayed : '',
    });
    setFormData(updated);
  };

  const handleInsecticideChange = (villageName: string, value: string) => {
    const current = formData.get(villageName);
    if (!current) return;

    const updated = new Map(formData);
    updated.set(villageName, {
      ...current,
      insecticideSprayed: value,
    });
    setFormData(updated);
  };

  const handleDateChange = (villageName: string, value: string) => {
    const current = formData.get(villageName);
    if (!current) return;

    const updated = new Map(formData);
    updated.set(villageName, {
      ...current,
      dateLastSprayed: value,
    });
    setFormData(updated);
  };

  const handleSubmit = () => {
    const villageDataArray = Array.from(formData.values());
    onSubmit(villageDataArray);
  };

  const isValid = () => {
    for (const data of formData.values()) {
      if (data.wasIrsSprayed) {
        // Check insecticide is filled
        if (!data.insecticideSprayed.trim()) {
          return false;
        }
        // Check date is filled and in valid format (YYYY-MM-DD)
        if (!data.dateLastSprayed || !data.dateLastSprayed.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>DHIS2 Sync - IRS Information</DialogTitle>
          <DialogDescription>
            For each village, indicate whether Indoor Residual Spraying (IRS)
            was conducted. If yes, provide the insecticide used and the date of
            the last spraying. This information will be applied to all sites in
            each village.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {villages.map(village => {
              const data = formData.get(village);
              if (!data) return null;

              return (
                <div
                  key={village}
                  className="border-border space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`irs-${village}`}
                      checked={data.wasIrsSprayed}
                      onCheckedChange={checked =>
                        handleCheckboxChange(village, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`irs-${village}`}
                      className="text-base font-semibold"
                    >
                      {village}
                    </Label>
                  </div>

                  {data.wasIrsSprayed && (
                    <div className="ml-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`insecticide-${village}`}>
                          Insecticide Sprayed
                        </Label>
                        <Select
                          value={data.insecticideSprayed}
                          onValueChange={value =>
                            handleInsecticideChange(village, value)
                          }
                        >
                          <SelectTrigger id={`insecticide-${village}`}>
                            <SelectValue placeholder="Select an insecticide" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSECTICIDE_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`date-${village}`}>
                          Date Last Sprayed
                        </Label>
                        <Input
                          id={`date-${village}`}
                          type="date"
                          value={data.dateLastSprayed}
                          onChange={e =>
                            handleDateChange(village, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
          >
            {isSubmitting ? 'Syncing...' : 'Sync to DHIS2'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
