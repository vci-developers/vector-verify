'use client';

import { useState } from 'react';
import { DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { X, Pencil, Check, XIcon } from 'lucide-react';
import type { SpecimenImage } from '@/shared/entities/specimen-image/model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  GENUS_MORPH_IDS,
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';
import { useUpdateSpecimennMutation } from '@/features/review/hooks/use-update-specimen';
import {
  isSpeciesEnabled,
  isSexEnabled,
  isAbdomenStatusEnabled,
} from '@/features/annotation/components/task-detail/annotation-form-panel/validation/annotation-form-schema';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from '@/ui/show-success-toast';
import { reviewKeys } from '@/features/review/api/review-keys';

const SPECIES_OPTIONS = [
  ...Object.values(SPECIES_MORPH_IDS).map(
    species => `${GENUS_MORPH_IDS.ANOPHELES}${species}`,
  ),
  GENUS_MORPH_IDS.CULEX,
  GENUS_MORPH_IDS.AEDES,
  GENUS_MORPH_IDS.MANSIONIA,
  GENUS_MORPH_IDS.NON_MOSQUITO,
];

const SEX_OPTIONS = Object.values(SEX_MORPH_IDS);
const ABDOMEN_STATUS_OPTIONS = Object.values(ABDOMEN_STATUS_MORPH_IDS);

function parseGenus(species: string | null | undefined): string | undefined {
  if (!species) return undefined;
  if (species.startsWith(GENUS_MORPH_IDS.ANOPHELES)) {
    return GENUS_MORPH_IDS.ANOPHELES;
  }
  return species;
}

interface ImageModalHeaderProps {
  specimenId: number;
  thumbnailImageId: number;
  thumbnailImage: SpecimenImage | null | undefined;
  onClose: () => void;
}

export function ImageModalHeader({
  specimenId,
  thumbnailImage,
  thumbnailImageId,
  onClose,
}: ImageModalHeaderProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editSpecies, setEditSpecies] = useState<string | null>(null);
  const [editSex, setEditSex] = useState<string | null>(null);
  const [editAbdomenStatus, setEditAbdomenStatus] = useState<string | null>(null);

  const updateMutation = useUpdateSpecimennMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.specimenImages(specimenId) });
      showSuccessToast('Specimen updated successfully.');
      setIsEditing(false);
    },
  });

  const species = thumbnailImage?.species;
  const sex = thumbnailImage?.sex;
  const abdomenStatus = thumbnailImage?.abdomenStatus;

  const currentGenus = parseGenus(isEditing ? editSpecies : species);
  const currentSex = isEditing ? editSex : sex;

  const sexEnabled = isSexEnabled(currentGenus);
  const abdomenStatusEnabled = isAbdomenStatusEnabled(currentGenus, currentSex ?? undefined);

  function handleEditClick() {
    setEditSpecies(species ?? null);
    setEditSex(sex ?? null);
    setEditAbdomenStatus(abdomenStatus ?? null);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditSpecies(null);
    setEditSex(null);
    setEditAbdomenStatus(null);
  }

  function handleSpeciesChange(value: string) {
    const newSpecies = value === 'none' ? null : value;
    setEditSpecies(newSpecies);
    
    const newGenus = parseGenus(newSpecies);
    
    if (!isSexEnabled(newGenus)) {
      setEditSex(null);
      setEditAbdomenStatus(null);
    }
  }

  function handleSexChange(value: string) {
    const newSex = value === 'none' ? null : value;
    setEditSex(newSex);
    
    if (!isAbdomenStatusEnabled(currentGenus, newSex ?? undefined)) {
      setEditAbdomenStatus(null);
    }
  }

  function handleAbdomenStatusChange(value: string) {
    setEditAbdomenStatus(value === 'none' ? null : value);
  }

  async function handleSave() {
    await updateMutation.mutateAsync({
      thumbnailImageId,
      specimenId,
      payload: {
        species: editSpecies,
        sex: editSex,
        abdomenStatus: editAbdomenStatus,
      },
    });
  }

  return (
    <div className="border-b px-4 pt-3 pb-2">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-lg font-semibold">
          {specimenId}
        </DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-muted h-6 w-6"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {isEditing ? (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Select
            value={editSpecies ?? 'none'}
            onValueChange={handleSpeciesChange}
            disabled={updateMutation.isPending}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {SPECIES_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={editSex ?? 'none'}
            onValueChange={handleSexChange}
            disabled={updateMutation.isPending || !sexEnabled}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Select Sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {SEX_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={editAbdomenStatus ?? 'none'}
            onValueChange={handleAbdomenStatusChange}
            disabled={updateMutation.isPending || !abdomenStatusEnabled}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Abdomen Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {ABDOMEN_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={handleCancelEdit}
              disabled={updateMutation.isPending}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {species && <div>Species: {species}</div>}
            {sex && <div>Sex: {sex}</div>}
            {abdomenStatus && <div>Abdomen Status: {abdomenStatus}</div>}
            {!species && !sex && !abdomenStatus && (
              <div className="text-muted-foreground/60 italic">No classification data</div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={handleEditClick}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      )}
    </div>
  );
}
