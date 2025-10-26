import { create } from 'zustand';

interface ImageStore {
  imagePaths: string[];
  currentImagePath: string | null;
  setImages: (paths: string[]) => void;
  setCurrentImage: (path: string) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  imagePaths: [],
  currentImagePath: null,
  setImages: (paths) => set({ imagePaths: paths, currentImagePath: paths.length > 0 ? paths[0] : null }),
  setCurrentImage: (path) => set({ currentImagePath: path }),
}));
