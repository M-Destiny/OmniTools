import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FilePreview from '../components/FilePreview';

// Configure pdf.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PdfToJpgTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [dpi, setDpi] = useState(150);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const convertToJpg = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF with pdf.js for rendering
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const zip = new JSZip();
      
      // Convert each page to image via canvas using pdf.js
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: dpi / 72 });
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render PDF page to canvas
        await page.render({ 
          canvasContext: ctx, 
          viewport: viewport,
          canvas: canvas
        } as any).promise;
        
        // Convert canvas to JPEG blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
        });
        
        // Add to zip
        const arrayBufferResult = await blob.arrayBuffer();
        zip.file(`page_${String(i).padStart(3, '0')}.jpg`, arrayBufferResult);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name.replace('.pdf', '')}_pages.zip`);
      
    } catch (err) {
      setError('Error converting PDF: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>PDF to JPG</h2>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>DPI: {dpi}</label>
        <input 
          type="range" 
          min="72" 
          max="300" 
          value={dpi}
          onChange={(e) => setDpi(Number(e.target.value))}
          style={{ width: '100%' }}
        />
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <>
          <FilePreview files={[file]} onRemove={() => setFile(null)} />
          
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            <button onClick={convertToJpg} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
              {converting ? '⏳ Converting...' : '🖼️ Convert to JPG'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfToJpgTool;