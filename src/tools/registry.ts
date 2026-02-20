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
    id: 'pdf-merge',
    name: 'PDF Merge Tool',
    description: 'Combine multiple PDF files into a single document.',
    category: 'pdf',
    icon: '📑'
  },
  {
    id: 'photos-to-pdf',
    name: 'Photos to PDF',
    description: 'Convert images (JPG, PNG) into a PDF document.',
    category: 'pdf',
    icon: '🖼️'
  }
];
