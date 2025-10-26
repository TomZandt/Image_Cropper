import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useImageStore } from '../stores/imageStore';
import { ImageFile, ImageCropData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../components/ui/button';

const Toolbar: React.FC = () => {
  const { images, currentImageIndex, setImages, setCurrentImageIndex } = useImageStore();

  const handleOpenFolder = async () => {
    try {
      const selectedPath: string | null = await invoke('select_folder');
      if (selectedPath) {
        // Use the new load_folder command
        const imagePaths: string[] = await invoke('load_folder', { path: selectedPath });
        
        const loadedImages: ImageFile[] = imagePaths.map((path) => {
          const name = path.split(/[\\/]/).pop() || '';
          // Initialize with default crop data
          const defaultCropData: ImageCropData = {
            versions: [
              {
                id: uuidv4(),
                name: 'Original',
                aspect: 'Freeform',
                crop: { x: 0, y: 0, width: 0, height: 0 }, // Will be updated after image loads
                export: { long_edge: 1080, jpeg_quality: 90 },
              },
            ],
            activeVersionId: '', // Will be set to the first version's ID
          };
          defaultCropData.activeVersionId = defaultCropData.versions[0].id;

          return {
            path,
            name,
            data: defaultCropData,
            thumbnail: '', // Thumbnail will be loaded separately
          };
        });
        setImages(loadedImages);
      }
    } catch (error) {
      console.error('Error opening folder or reading images:', error);
    }
  };

  const handleExport = async () => {
    if (images.length === 0) {
      console.warn('No images to export.');
      return;
    }
    // Implement actual export logic using export_versions
    const currentImage = currentImageIndex !== null ? images[currentImageIndex] : undefined;
    if (currentImage) {
      try {
        // For simplicity, let's assume output_dir is a fixed "exports" folder in the user's documents directory
        // In a real app, you'd let the user select this.
        const outputDir = await invoke('path_to_resource', { path: 'DOWNLOADS' }); // Example: using a Tauri path plugin
        await invoke('export_versions', {
          imagePath: currentImage.path,
          versions: currentImage.data.versions,
          outputDir: `${outputDir}/ImageCropperExports`,
        });
        console.log('Export completed!');
      } catch (error) {
        console.error('Error during export:', error);
      }
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex !== null && images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex !== null && images.length > 0) {
      const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
      setCurrentImageIndex(prevIndex);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">Image Cropper</h1>
      <div className="flex space-x-4">
        <Button onClick={handleOpenFolder}>
          Open Folder
        </Button>
        <Button onClick={handlePreviousImage} disabled={images.length === 0}>
          Previous
        </Button>
        <Button onClick={handleNextImage} disabled={images.length === 0}>
          Next
        </Button>
        <Button onClick={handleExport} disabled={images.length === 0}>
          Export All
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
