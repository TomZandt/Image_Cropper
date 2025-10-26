// src/types.ts

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportSettings {
  long_edge: number;
  jpeg_quality: number;
}

export interface CropVersion {
  id: string;
  name: string;
  aspect: string;
  crop: Crop;
  export: ExportSettings;
}

export interface ImageCropData {
  versions: CropVersion[];
  activeVersionId: string;
}

export interface ImageFile {
  path: string;
  name: string;
  data: ImageCropData;
  thumbnail?: string; // Base64 thumbnail for display
}
