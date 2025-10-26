import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useImageStore } from '../stores/imageStore';

const Toolbar: React.FC = () => {
  const setImages = useImageStore((state) => state.setImages);

  const handleOpenFolder = async () => {
    try {
      const selectedPath: string | null = await invoke('select_folder');
      if (selectedPath) {
        const imagePaths: string[] = await invoke('read_images_from_folder', { path: selectedPath });
        setImages(imagePaths);
      }
    } catch (error) {
      console.error('Error opening folder or reading images:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">Image Cropper</h1>
      <button
        onClick={handleOpenFolder}
        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        Open Folder
      </button>
    </div>
  );
};

export default Toolbar;
