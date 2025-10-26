import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Stage, Layer, Image, Rect } from "react-konva";
import useImage from "use-image";
import "./App.css";

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const [konvaImage] = useImage(base64Image || "");

  useEffect(() => {
    if (konvaImage) {
      setImage(konvaImage);
      // Initialize crop to cover the entire image
      setCrop({ x: 0, y: 0, width: konvaImage.width, height: konvaImage.height });
    }
  }, [konvaImage]);

  useEffect(() => {
    async function loadCurrentImage() {
      if (imagePaths.length > 0 && currentImageIndex < imagePaths.length) {
        const path = imagePaths[currentImageIndex];
        try {
          // Request a resized image for display to improve performance
          const base64 = await invoke("get_image_base64", { path, maxDimension: 1200 });
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
  }, [imagePaths, currentImageIndex]);

  async function selectFolder() {
    const selectedPath: string | null = await invoke("select_folder");
    if (selectedPath) {
      setFolderPath(selectedPath);
      // The Rust command `read_images_from_folder` expects a PathBuf,
      // but `invoke` handles the conversion from string automatically.
      const paths: string[] = await invoke("read_images_from_folder", { path: selectedPath });
      setImagePaths(paths);
      setCurrentImageIndex(0);
    }
  }

  const handleCropChange = (e: any) => {
    setCrop({
      x: e.target.x(),
      y: e.target.y(),
      width: e.target.width() * e.target.scaleX(),
      height: e.target.height() * e.target.scaleY(),
    });
  };

  async function exportImage() {
    if (!imagePaths[currentImageIndex] || !folderPath) {
      alert("Please select a folder and an image first.");
      return;
    }

    const sourcePath = imagePaths[currentImageIndex];
    const fileName = sourcePath.split('/').pop() || `cropped_image_${Date.now()}.png`;
    const outputDir = `${folderPath}/exports`; // Create an 'exports' subfolder
    
    // Ensure the output directory exists
    await invoke("create_dir_if_not_exists", { path: outputDir }); // This command needs to be added to Rust

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
    <main className="container">
      <h1>Image Cropper</h1>

      <div className="row">
        <button onClick={selectFolder}>Select Folder</button>
        {imagePaths.length > 0 && <button onClick={exportImage}>Export Cropped Image</button>}
      </div>

      {folderPath && <p>Selected Folder: {folderPath}</p>}
      {imagePaths.length > 0 && <p>Current Image: {imagePaths[currentImageIndex]}</p>}
      {imagePaths.length > 0 && (
        <div className="row">
          <button onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))} disabled={currentImageIndex === 0}>Previous</button>
          <button onClick={() => setCurrentImageIndex(prev => Math.min(imagePaths.length - 1, prev + 1))} disabled={currentImageIndex === imagePaths.length - 1}>Next</button>
        </div>
      )}

      {imagePaths.length > 0 && (
        <div>
          <p>Image {currentImageIndex + 1} of {imagePaths.length}</p>
          <Stage width={800} height={600} style={{ border: "1px solid grey" }}>
            <Layer>
              {image && (
                <Image
                  image={image}
                  width={image.width > 800 ? 800 : image.width}
                  height={image.height > 600 ? 600 : image.height}
                  x={0}
                  y={0}
                />
              )}
              {image && (
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
        </div>
      )}
    </main>
  );
}

export default App;
