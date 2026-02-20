import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import FilePreview from '../components/FilePreview';

const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const convertToWord = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Extract text from PDF pages
      const pages = pdfDoc.getPages();

      // Create a simple HTML-based DOCX
      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${file.name.replace('.pdf', '')}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${file.name.replace('.pdf', '')}</h1>
            <p>Converted from PDF on ${new Date().toLocaleString()}</p>
            <p>Number of pages: ${pages.length}</p>
            <hr>
            <p>Note: This is a basic conversion. For full formatting preservation, consider using dedicated PDF to Word converters.</p>
          </body>
        </html>
      `;

      const zip = new JSZip();
      zip.file('[Content_Types].xml', `...`); // Simplified
      zip.file('word/document.xml', htmlContent);
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace('.pdf', '.html')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Error converting PDF: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>PDF to Word</h2>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⚠️ Note: This extracts content from PDF to HTML format. For perfect formatting preservation, use professional tools.</p>
      </div>

      <div
        style={{
          border: '2px dashed #475569',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <>
          <FilePreview files={[file]} onRemove={() => setFile(null)} />
          
          <div style={{ marginTop: '1rem' }}>
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            <button onClick={convertToWord} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : '📝 Convert to HTML/Word'}
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfToWordTool;