# OmniTools

A comprehensive collection of small, powerful tools for everyday tasks. Built with Vite + React + TypeScript, deployed on Vercel. Simple, fast, secure, and responsive across all devices.

## ✨ Features

### 📦 JSON Tools
- **JSON Optimizer** — Deep deduplicate and format large JSON files

### 📝 Text Tools
- **Text Converter** — Change case, remove whitespace, and clean text
- **Word Counter** — Detailed analysis of text length and word count
- **Image Compress** — Reduce image file size while maintaining quality

### 📄 PDF Tools (17 Total)
- **PDF Merge** — Combine multiple PDF files into one
- **PDF Compress** — Reduce PDF file size by optimizing images and structure
- **PDF to Word** — Convert PDF documents to editable Word (.docx) format
- **Word to PDF** — Convert Word documents to PDF format
- **PDF to Excel** — Extract tables from PDF to Excel (.xlsx) format
- **Excel to PDF** — Convert Excel spreadsheets to PDF format
- **PDF to PowerPoint** — Convert PDF pages to PowerPoint (.pptx) slides
- **PowerPoint to PDF** — Convert PowerPoint presentations to PDF format
- **PDF to JPG** — Convert PDF pages to high-quality JPG images
- **JPG to PDF** — Combine JPG images into a single PDF document
- **Photos to PDF** — Convert images (JPG, PNG, GIF) into a PDF document
- **Sign PDF** — Add digital signatures or handwritten signatures to PDFs
- **PDF Watermark** — Add text or image watermarks to PDF documents

## 🚀 Live Demo

🔗 [OmniTools Live](https://omni-tools.vercel.app)

## 📖 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn]

### Clone Repository
```bash
$ git clone https://github.com/M-Destiny/OmniTools.git
$ cd OmniTools
```

### Install Dependencies
```bash
$ npm install
# or
$ yarn install
```

### Run Locally
```bash
$ npm run dev
# or
$ yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to see the result.

### Build for Production
```bash
$ npm run build
$ npm start
```

### Deploy to Vercel (Recommended)
```bash
$ npm install -g vercel
$ vercel
```

## 🛠️ Project Structure

```plaintext
omnitools/
├── src/
│   ├── tools/              # Tool components
│   │   ├── ImageCompressTool.tsx
│   │   ├── PdfMergeTool.tsx
│   │   ├── PdfCompressTool.tsx
│   │   ├── PdfToWordTool.tsx
│   │   ├── WordToPdfTool.tsx
│   │   ├── PdfToExcelTool.tsx
│   │   ├── ExcelToPdfTool.tsx
│   │   ├── PdfToPowerPointTool.tsx
│   │   ├── PowerPointToPdfTool.tsx
│   │   ├── PdfToJpgTool.tsx
│   │   ├── JpgToPdfTool.tsx
│   │   ├── PdfSignTool.tsx
│   │   ├── PdfWatermarkTool.tsx
│   │   ├── PhotosToPdfTool.tsx
│   │   ├── jsonOptimizer.tsx
│   │   ├── textConverter.tsx
│   │   └── wordCounter.tsx
│   ├── pages/              # React pages
│   │   ├── Home.tsx
│   │   └── ToolDetail.tsx
│   ├── components/         # Reusable components
│   │   └── Navbar.tsx
│   ├── App.tsx             # Main entry-point
│   └── index.tsx           # Rendering logic
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

1. Fork this repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to your branch: `git push origin feature-name`
5. Create a Pull Request

### Adding a New Tool

1. Create a new React component in `src/tools/`
2. Export it as default
3. Add it to `src/tools/registry.ts`
4. Import it in `src/pages/ToolDetail.tsx`
5. Test and build: `npm run build`
6. Commit and push

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS-in-JS (inline styles)
- **Deployment:** Vercel
- **PDF Library:** pdf-lib
- **Image Handling:** HTML5 Canvas
- **Zip Handling:** JSZip
- **File Saving:** FileSaver

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built by **Destiny** and **Clawe** 🐾
- PDF functionality powered by [pdf-lib](https://pdf-lib.js.org/)
- Built with ❤️ using modern web technologies

---

**Made with ❤️ by Destiny and Clawe 🐾**

[Live Demo](https://omni-tools.vercel.app) | [GitHub Repo](https://github.com/M-Destiny/OmniTools) | [Report Issue](https://github.com/M-Destiny/OmniTools/issues)
