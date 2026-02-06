export interface SpecimenImageDto {
  id: number;
  url: string;
  species: string | null;
  sex: string | null;
  abdomenStatus: string | null;
  capturedAt: number | null;
  submittedAt: number;
  inferenceResult: string | null;
  filemd5: string;
}

export interface SpecimenImagesResponseDto {
  images: SpecimenImageDto[];
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
}
