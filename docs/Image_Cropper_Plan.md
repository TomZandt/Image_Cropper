# 🖼️ Image Cropper

A fast, cross-platform image cropping and export tool built with **Tauri + React + Rust**.  
Designed for photographers and creators who want precise, multi-version cropping with modern UI, nondestructive editing, and batch export options.

---

## 🚀 Overview

**Image Cropper** allows users to:
- Load a folder of images (JPEG, PNG)
- Create and edit **multiple crop versions** per image (e.g., 16:9, 1:1, etc.)
- Store all crop data in lightweight **JSON sidecar files**
- Export all versions at once with adjustable **JPEG quality** and **long-edge resize**
- Run smoothly even with large 24MP files (Fuji X100VI and similar)

Built with **React (frontend)** for speed of development and **Rust (backend)** for native image processing performance.

---

## 🧩 Key Features

### 🖼️ Image Editing
- Load entire folders of images
- Display images with zoom & pan support
- Adjustable crop overlays with draggable handles
- Aspect ratio presets: `1:1`, `4:3`, `16:9`, `9:16`, `Freeform`
- Grid overlay (rule of thirds, golden ratio)
- Keyboard navigation for next/previous image

### 🌈 Versions
- Create multiple crop versions per image
- Each version stores its own:
  - Aspect ratio
  - Crop rectangle
  - Export settings (JPEG quality, long edge, file name)
- Easily switch between versions
- Optional version presets (e.g., “Instagram 1:1”, “YouTube 16:9”)

### 📦 Sidecar Files
Each image has an accompanying `.crop.json` file:

```json
{
  "versions": [
    {
      "id": "v1",
      "name": "Instagram 1:1",
      "aspect": "1:1",
      "crop": { "x": 300, "y": 100, "width": 1500, "height": 1500 },
      "export": { "long_edge": 1080, "jpeg_quality": 90 }
    },
    {
      "id": "v2",
      "name": "YouTube 16:9",
      "aspect": "16:9",
      "crop": { "x": 100, "y": 200, "width": 1920, "height": 1080 },
      "export": { "long_edge": 2000, "jpeg_quality": 85 }
    }
  ],
  "activeVersionId": "v1"
}
```

- Non-destructive edits (original images never modified)
- Easily reload folders and continue where you left off

### ⚙️ Export
- Export individual or all versions at once
- Choose output folder
- Adjustable JPEG quality (0–100%)
- Resize by long edge (maintaining aspect ratio)
- Optional subfolder per version:
  ```
  /exports
    /Instagram_1x1
      photo1.jpg
    /YouTube_16x9
      photo1.jpg
  ```

---

## 🧱 Architecture

### 🖥️ Desktop App Stack
| Layer | Technology | Purpose |
|--------|-------------|----------|
| **Frontend UI** | React + Vite + TypeScript | Modern, responsive interface |
| **UI Components** | Tailwind CSS + ShadCN/UI + Framer Motion | Clean, animated UI |
| **Canvas Overlay** | Konva.js | Crop and transform overlay |
| **State Management** | Zustand | Lightweight, persistent state |
| **Backend** | Rust + Tauri Commands | Native performance for file I/O and image processing |
| **Image Processing** | Rust `image` crate or `libvips` binding | Crop, resize, encode |
| **Storage** | JSON sidecars + local settings | Simple, versionable persistence |
| **Cross-platform Build** | Tauri | Compact, secure desktop packaging |

---

## 🧮 Data Model

### TypeScript Interfaces

```ts
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
```

---

## 🗂️ Folder Structure

```
/image-cropper
├── src/
│   ├── main.rs             # Rust backend (Tauri commands)
│   ├── image_processing.rs # Crop/resize/encode functions
│   └── commands.rs         # File operations
│
├── src-tauri/
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # App config
│
├── frontend/
│   ├── App.tsx             # React root component
│   ├── components/         # UI elements (CropOverlay, VersionList, Toolbar)
│   ├── hooks/              # Zustand stores and sidecar handling
│   ├── utils/              # File helpers, math, etc.
│   └── styles/             # Tailwind setup
│
├── /public/
│   └── icons/
│
└── README.md
```

---

## ⚡ Core Workflows

### 1. Folder Import
- Select folder → Tauri backend scans for images (`.jpg`, `.png`)
- Load metadata + existing `.crop.json` files
- Populate store with image + version data

### 2. Crop Editing
- Show full-res image in Konva canvas
- Overlay current crop rectangle
- On drag/resize → update state + save JSON sidecar via Rust file API

### 3. Export
- For each image + version:
  - Load source image from disk
  - Apply crop rectangle
  - Resize (based on long edge)
  - Encode as JPEG with given quality
  - Write to `exports/{versionName}/filename.jpg`

---

## ⚙️ Dependencies

### Frontend
- `react`, `react-dom`, `vite`, `typescript`
- `konva`, `react-konva`
- `zustand`
- `tailwindcss`
- `@shadcn/ui`
- `framer-motion`

### Backend (Rust)
- `tauri`
- `serde`, `serde_json`
- `image` (for crop, resize, encode)
- `rayon` (for parallel batch export)
- `anyhow` / `thiserror` (for error handling)

---

## 🧰 Future Features

| Feature | Description |
|----------|--------------|
| 🧠 Smart Crop | Auto-detect subject or faces (OpenCV/YOLO integration) |
| 🎞️ Batch Previews | Side-by-side version comparison |
| 🧷 Crop Sync | Copy crop coordinates between versions |
| 🌐 WASM Build | Optional browser version (React + WASM backend) |
| 💾 Preset Manager | Save & reuse version/export presets globally |
| 🔄 Undo/Redo | Full history of crop changes |
| 🔒 Metadata Handling | Preserve EXIF data in exports |

---

## 🧱 Build & Run

```bash
# install dependencies
npm install

# run dev mode
npm run tauri dev

# build for production
npm run tauri build
```

---

## 🧑‍💻 Why Tauri?

- **Lightweight**: ~10–20 MB total app size  
- **Secure**: Sandboxed backend communication  
- **Fast**: Rust handles all heavy lifting for large JPEGs  
- **Familiar**: Frontend built with React, just like a modern web app  

---

## 🧾 License
MIT License © 2025 Your Name  
Free to use, modify, and distribute.

---

## 💬 Summary

**Image Cropper** delivers the best of both worlds:
- 🧠 Web-like development with React
- ⚡ Native performance with Rust
- 💾 Portable, nondestructive editing via JSON sidecars
- 🌍 Cross-platform builds for macOS, Windows, and Linux

> “A lightweight, photographer-friendly batch crop tool — built for speed, precision, and control.”
