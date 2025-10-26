import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Stage, Layer, Image, Rect } from "react-konva";
import useImage from "use-image";
import "./App.css";
import Toolbar from "./components/Toolbar";
import { useImageStore } from "./stores/imageStore";

function App() {
  const { imagePaths, currentImagePath, setCurrentImage } = useImageStore();
  const currentImageIndex = currentImagePath ? imagePaths.indexOf(currentImagePath) : -1;
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const [konvaImage] = useImage(base64Image || "");

  useEffect(() => {
    if (konvaImage) {
      setImageElement(konvaImage);
      // Initialize crop to cover the entire image
      setCrop({ x: 0, y: 0, width: konvaImage.width, height: konvaImage.height });
    }
  }, [konvaImage]);

  useEffect(() => {
    async function loadCurrentImage() {
      if (currentImagePath) {
        try {
          // Request a resized image for display to improve performance
          const base64 = await invoke("get_image_base64", { path: currentImagePath, maxDimension: 1200 });
          setBase64Image(base64 as string);
        } catch (error) {
          console.error("Failed to load image as base64:", error);
          setBase64Image(null);
        }
      } else {
        setBase64Image(null);
      }
    }
    loadCurrentImage();
  }, [currentImagePath]);

  const handleCropChange = (e: any) => {
    setCrop({
      x: e.target.x(),
      y: e.target.y(),
      width: e.target.width() * e.target.scaleX(),
      height: e.target.height() * e.target.scaleY(),
    });
  };

  async function exportImage() {
    if (!currentImagePath) {
      alert("Please select an image first.");
      return;
    }

    const sourcePath = currentImagePath;
    const fileName = sourcePath.split('/').pop() || `cropped_image_${Date.now()}.png`;
    // Assuming the folderPath is the directory of the current image for now,
    // or we might need a separate state for the output folder.
    // For simplicity, let's use the parent directory of the current image.
    const parentDir = currentImagePath.substring(0, currentImagePath.lastIndexOf('/'));
    const outputDir = `${parentDir}/exports`;
    
    await invoke("create_dir_if_not_exists", { path: outputDir });

    const outputPath = `${outputDir}/${fileName}`;

    try {
      await invoke("crop_and_save_image", {
        sourcePath,
        outputPath,
        x: Math.round(crop.x),
        y: Math.round(crop.y),
        width: Math.round(crop.width),
        height: Math.round(crop.height),
      });
      alert(`Image exported to: ${outputPath}`);
    } catch (error) {
      alert(`Error exporting image: ${error}`);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Toolbar />
      <main className="flex-grow container mx-auto p-4">
        {imagePaths.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentImage(imagePaths[currentImageIndex - 1])}
              disabled={currentImageIndex === 0}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <p>Image {currentImageIndex + 1} of {imagePaths.length}</p>
            <button
              onClick={() => setCurrentImage(imagePaths[currentImageIndex + 1])}
              disabled={currentImageIndex === imagePaths.length - 1}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {currentImagePath && (
          <div className="flex flex-col items-center">
            <p className="mb-2">Current Image: {currentImagePath.split('/').pop()}</p>
            <Stage width={800} height={600} style={{ border: "1px solid grey", backgroundColor: "#333" }}>
              <Layer>
                {imageElement && (
                  <Image
                    image={imageElement}
                    width={imageElement.width > 800 ? 800 : imageElement.width}
                    height={imageElement.height > 600 ? 600 : imageElement.height}
                    x={0}
                    y={0}
                  />
                )}
                {imageElement && (
                  <Rect
                    x={crop.x}
                    y={crop.y}
                    width={crop.width}
                    height={crop.height}
                    stroke="red"
                    strokeWidth={2}
                    draggable
                    onDragEnd={handleCropChange}
                    onTransformEnd={handleCropChange}
                  />
                )}
              </Layer>
            </Stage>
            <button
              onClick={exportImage}
              className="mt-4 px-6 py-3 bg-green-600 rounded-md hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              Export Cropped Image
            </button>
          </div>
        )}
        {!currentImagePath && imagePaths.length === 0 && (
          <p className="text-center text-lg mt-8">Please use "Open Folder" to load images.</p>
        )}
      </main>
    </div>
  );
}

export default App;
