# 🖼️ Image Cropper

A fast, cross-platform image cropping and export tool built with **Tauri + React + Rust**. Designed for photographers and creators who want precise, multi-version cropping with modern UI, nondestructive editing, and batch export options.

---

## 🚀 Overview

**Image Cropper** allows users to:
- Load a folder of images (JPEG, PNG)
- Create and edit **multiple crop versions** per image (e.g., 16:9, 1:1, etc.)
- Store all crop data in lightweight **JSON sidecar files**
- Export all versions at once with adjustable **JPEG quality** and **long-edge resize**

Built with **React (frontend)** for speed of development and **Rust (backend)** for native image processing performance.

---

## 🧱 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend UI** | React + Vite + TypeScript |
| **UI Components** | Tailwind CSS + ShadCN/UI |
| **Canvas Overlay** | Konva.js |
| **State Management** | Zustand |
| **Backend** | Rust + Tauri Commands |
| **Image Processing** | Rust `image` crate |
| **Cross-platform Build** | Tauri |

---

## ⚡ Build & Run

First, install the dependencies:
```bash
npm install
```

To run the app in development mode:
```bash
npm run tauri dev
```

To build the app for production:
```bash
npm run tauri build
```

---

## 🧾 License
This project is licensed under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.
