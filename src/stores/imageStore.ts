import { create } from 'zustand';
import { ImageFile, ImageCropData, CropVersion, Crop, ExportSettings } from '../types';
import { immer } from 'zustand/middleware/immer';

interface ImageStore {
  images: ImageFile[];
  currentImageIndex: number | null;
  
  // Actions
  setImages: (images: ImageFile[]) => void;
  setCurrentImageIndex: (index: number) => void;
  updateImageCropData: (imagePath: string, newCropData: ImageCropData) => void;
  addCropVersion: (imagePath: string, version: CropVersion) => void;
  updateCropVersion: (imagePath: string, versionId: string, newCrop: Crop, newExport: ExportSettings) => void;
  setActiveVersion: (imagePath: string, versionId: string) => void;
  deleteCropVersion: (imagePath: string, versionId: string) => void;
}

export const useImageStore = create<ImageStore>()(
  immer((set) => ({
    images: [],
    currentImageIndex: null,

    setImages: (images) =>
      set((state) => {
        state.images = images;
        state.currentImageIndex = images.length > 0 ? 0 : null;
      }),

    setCurrentImageIndex: (index) =>
      set((state) => {
        if (index >= 0 && index < state.images.length) {
          state.currentImageIndex = index;
        }
      }),

    updateImageCropData: (imagePath, newCropData) =>
      set((state) => {
        const image = state.images.find((img: ImageFile) => img.path === imagePath);
        if (image) {
          image.data = newCropData;
        }
      }),

    addCropVersion: (imagePath, version) =>
      set((state) => {
        const image = state.images.find((img: ImageFile) => img.path === imagePath);
        if (image) {
          image.data.versions.push(version);
          image.data.activeVersionId = version.id; // Set new version as active
        }
      }),

    updateCropVersion: (imagePath, versionId, newCrop, newExport) =>
      set((state) => {
        const image = state.images.find((img: ImageFile) => img.path === imagePath);
        if (image) {
          const version = image.data.versions.find((v: CropVersion) => v.id === versionId);
          if (version) {
            version.crop = newCrop;
            version.export = newExport;
          }
        }
      }),

    setActiveVersion: (imagePath, versionId) =>
      set((state) => {
        const image = state.images.find((img: ImageFile) => img.path === imagePath);
        if (image) {
          image.data.activeVersionId = versionId;
        }
      }),

    deleteCropVersion: (imagePath, versionId) =>
      set((state) => {
        const image = state.images.find((img: ImageFile) => img.path === imagePath);
        if (image) {
          image.data.versions = image.data.versions.filter((v: CropVersion) => v.id !== versionId);
          // If the deleted version was active, set the first remaining version as active, or null
          if (image.data.activeVersionId === versionId) {
            image.data.activeVersionId = image.data.versions.length > 0 ? image.data.versions[0].id : '';
          }
        }
      }),
  }))
);
