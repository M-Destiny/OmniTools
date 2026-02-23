export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: 'json' | 'text' | 'pdf' | 'ai';
  icon: string;
}

export type ToolCategory = 'json' | 'text' | 'pdf' | 'ai';

export const tools: ToolMetadata[] = [
  {
    id: 'json-optimizer',
    name: 'JSON Optimizer',
    description: 'Deep deduplicate and format large JSON files.',
    category: 'json',
    icon: '📦'
  },
  {
    id: 'text-converter',
    name: 'Text Converter',
    description: 'Change case, remove whitespace, and clean text.',
    category: 'text',
    icon: '📝'
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Detailed analysis of text length and word count.',
    category: 'text',
    icon: '📊'
  },
  {
    id: 'image-compress',
    name: 'Image Compress',
    description: 'Reduce image file size while maintaining quality.',
    category: 'text',
    icon: '🗜️'
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge Tool',
    description: 'Combine multiple PDF files into a single document.',
    category: 'pdf',
    icon: '📑'
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Reduce PDF file size by optimizing images and structure.',
    category: 'pdf',
    icon: '📉'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word (.docx) format.',
    category: 'pdf',
    icon: '📝'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format.',
    category: 'pdf',
    icon: '📄'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables from PDF to Excel (.xlsx) format.',
    category: 'pdf',
    icon: '📊'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format.',
    category: 'pdf',
    icon: '📈'
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    description: 'Convert PDF pages to PowerPoint (.pptx) slides.',
    category: 'pdf',
    icon: '🎬'
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF format.',
    category: 'pdf',
    icon: '📽️'
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images.',
    category: 'pdf',
    icon: '🖼️'
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Combine JPG images into a single PDF document.',
    category: 'pdf',
    icon: '📷'
  },
  {
    id: 'pdf-sign',
    name: 'Sign PDF',
    description: 'Add digital signatures or handwritten signatures to PDFs.',
    category: 'pdf',
    icon: '✍️'
  },
  {
    id: 'pdf-editor',
    name: 'PDF Editor',
    description: 'Edit PDF text, add new text, change fonts, colors, and positioning.',
    category: 'pdf',
    icon: '📝'
  },
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark',
    description: 'Add text or image watermarks to PDF documents.',
    category: 'pdf',
    icon: '💧'
  },
  {
    id: 'photos-to-pdf',
    name: 'Photos to PDF',
    description: 'Convert images (JPG, PNG) into a PDF document.',
    category: 'pdf',
    icon: '🏞️'
  }
];
