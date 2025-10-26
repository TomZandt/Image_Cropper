import React, { useEffect } from "react";
import "./App.css";
import Toolbar from "./components/Toolbar";
import ImageList from "./components/ImageList";
import ImageCanvas from "./components/ImageCanvas";
import VersionPanel from "./components/VersionPanel";
import { useImageStore } from "./stores/imageStore";
import { invoke } from "@tauri-apps/api/core";
import { ImageFile } from "./types";

function App() {
  const { images, currentImageIndex, updateImageCropData } = useImageStore();
  const currentImage = currentImageIndex !== null ? images[currentImageIndex] : undefined;

  // Effect to load thumbnail for the current image
  useEffect(() => {
    async function loadThumbnail() {
      if (currentImage && !currentImage.thumbnail) {
        try {
          const base64 = await invoke("get_image_base64", {
            path: currentImage.path,
            maxDimension: 200, // Smaller dimension for thumbnail
          });
          // Update the specific image's thumbnail in the store
          useImageStore.setState((state) => {
            const imageToUpdate = state.images.find((img) => img.path === currentImage.path);
            if (imageToUpdate) {
              imageToUpdate.thumbnail = base64 as string;
            }
          });
        } catch (error) {
          console.error("Failed to load thumbnail as base64:", error);
        }
      }
    }
    loadThumbnail();
  }, [currentImage]);

  // Effect to update the crop data in the store when the image dimensions are known
  useEffect(() => {
    if (currentImage && currentImage.thumbnail) {
      const img: HTMLImageElement = new window.Image();
      img.src = currentImage.thumbnail;
      img.onload = () => {
        const activeVersion = currentImage.data.versions.find(
          (v) => v.id === currentImage.data.activeVersionId
        );
        if (activeVersion && activeVersion.crop.width === 0 && activeVersion.crop.height === 0) {
          // Initialize crop to full image if not set
          const updatedVersions = currentImage.data.versions.map((v) =>
            v.id === currentImage.data.activeVersionId
              ? { ...v, crop: { x: 0, y: 0, width: img.width, height: img.height } }
              : v
          );
          updateImageCropData(currentImage.path, {
            ...currentImage.data,
            versions: updatedVersions,
          });
        }
      };
    }
  }, [currentImage, updateImageCropData]);


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ImageList />
        <ImageCanvas />
        <VersionPanel />
      </div>
    </div>
  );
}

export default App;
