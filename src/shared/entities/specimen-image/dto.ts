export interface SpecimenImageDto {
  id: number;
  url: string;
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  capturedAt: number | null;
  submittedAt: number;
}

export interface SpecimenImagesResponseDto {
  images: SpecimenImageDto[];
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
}
