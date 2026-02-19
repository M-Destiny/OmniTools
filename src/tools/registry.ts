import React from 'react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: 'json' | 'text' | 'pdf' | 'ai';
  icon: string;
}

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
  }
];
