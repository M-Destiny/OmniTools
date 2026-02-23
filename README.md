# OmniTools 🛠️

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-purple?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Vercel-Deploy-black?style=flat&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License">
</p>

A comprehensive collection of small, powerful tools for everyday tasks. Built with Vite + React + TypeScript, deployed on Vercel. Simple, fast, secure, and responsive across all devices.

## ✨ Features

### 📦 JSON Tools
| Tool | Description |
|------|-------------|
| **JSON Optimizer** | Deep deduplicate and format large JSON files |

### 📝 Text Tools
| Tool | Description |
|------|-------------|
| **Text Converter** | Change case, remove whitespace, and clean text |
| **Word Counter** | Detailed analysis of text length and word count |
| **Image Compress** | Reduce image file size while maintaining quality |

### 📄 PDF Tools (18 Total)

#### Merge & Compress
| Tool | Description |
|------|-------------|
| **PDF Merge** | Combine multiple PDF files into one |
| **PDF Compress** | Reduce PDF file size by optimizing images and structure |

#### Convert From PDF
| Tool | Description |
|------|-------------|
| **PDF to Word** | Convert PDF documents to editable Word (.docx) format |
| **PDF to Excel** | Extract tables from PDF to Excel (.xlsx) format |
| **PDF to PowerPoint** | Convert PDF pages to PowerPoint (.pptx) slides |
| **PDF to JPG** | Convert PDF pages to high-quality JPG images |

#### Convert To PDF
| Tool | Description |
|------|-------------|
| **Word to PDF** | Convert Word documents to PDF format |
| **Excel to PDF** | Convert Excel spreadsheets to PDF format |
| **PowerPoint to PDF** | Convert PowerPoint presentations to PDF format |
| **JPG to PDF** | Combine JPG images into a single PDF document |
| **Photos to PDF** | Convert images (JPG, PNG, GIF) into a PDF document |

#### PDF Editing
| Tool | Description |
|------|-------------|
| **PDF Editor** | Edit PDF text, add new text, change fonts, colors, and positioning |
| **Sign PDF** | Add digital signatures or handwritten signatures to PDFs |
| **PDF Watermark** | Add text or image watermarks to PDF documents |

## 🚀 Live Demo

🔗 **[OmniTools Live](https://omni-tools.vercel.app)**

## 📖 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Clone Repository
```bash
git clone https://github.com/M-Destiny/OmniTools.git
cd OmniTools
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Run Locally
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build for Production
```bash
npm run build
npm run preview
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

## 🏗️ Project Structure

```
omnitools/
├── src/
│   ├── tools/              # Tool components
│   │   ├── ExcelToPdfTool.tsx
│   │   ├── ImageCompressTool.tsx
│   │   ├── JpgToPdfTool.tsx
│   │   ├── jsonOptimizer.tsx
│   │   ├── PdfCompressTool.tsx
│   │   ├── PdfEditorTool.tsx      ✨ NEW
│   │   ├── PdfMergeTool.tsx
│   │   ├── PdfSignTool.tsx
│   │   ├── PdfToExcelTool.tsx
│   │   ├── PdfToJpgTool.tsx
│   │   ├── PdfToPowerPointTool.tsx
│   │   ├── PdfToWordTool.tsx
│   │   ├── PdfWatermarkTool.tsx
│   │   ├── PhotosToPdfTool.tsx
│   │   ├── PowerPointToPdfTool.tsx
│   │   ├── registry.ts
│   │   ├── textConverter.tsx
│   │   ├── WordToPdfTool.tsx
│   │   └── wordCounter.tsx
│   ├── pages/              # React pages
│   │   ├── Home.tsx
│   │   └── ToolDetail.tsx
│   ├── components/         # Reusable components
│   │   └── Navbar.tsx
│   ├── context/            # React context
│   ├── hooks/              # Custom hooks
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main entry-point
│   └── main.tsx            # Rendering logic
│
├── public/                 # Static assets
│   └── index.html
│
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## 🤝 Contribution Guide

We welcome contributions to make this project the ultimate toolbox!

### How to Contribute

1. **Fork** this repository
2. **Create** a new branch: `git checkout -b feature-name`
3. **Make** your changes and commit: `git commit -m 'Add new feature'`
4. **Push** to your branch: `git push origin feature-name`
5. **Create** a Pull Request

### Adding a New Tool

1. Create a new React component in `src/tools/`
2. Export it as default
3. Add it to `src/tools/registry.ts`
4. Import it in `src/pages/ToolDetail.tsx`
5. Test and build: `npm run build`
6. Commit and push

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **pdf-lib** | PDF Manipulation |
| **JSZip** | Zip File Handling |
| **FileSaver.js** | File Download Handling |
| **HTML5 Canvas** | Image Processing |
| **Vercel** | Deployment Platform |

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built by **Destiny** and **Clawe** 🐾
- PDF functionality powered by [pdf-lib](https://pdf-lib.js.org/)
- Built with ❤️ using modern web technologies

---

<p align="center">
  <strong>Made with ❤️ by Destiny and Clawe 🐾</strong>
</p>

<p align="center">
  <a href="https://omni-tools.vercel.app">Live Demo</a> •
  <a href="https://github.com/M-Destiny/OmniTools">GitHub Repo</a> •
  <a href="https://github.com/M-Destiny/OmniTools/issues">Report Issue</a>
</p>
