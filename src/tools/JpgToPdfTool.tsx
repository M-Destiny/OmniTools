import React, { useState, useRef } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import FilePreview from '../components/FilePreview';

const JpgToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState<keyof typeof PageSizes>('A4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        validImageTypes.includes(f.type)
      );
      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      return newFiles;
    });
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const img = await loadImage(file);
        const pageDims = PageSizes[pageSize];
        const page = pdfDoc.addPage(pageDims);
        
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        const scale = Math.min(
          (pageWidth - 40) / img.width,
          (pageHeight - 40) / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        const bytes = await file.arrayBuffer();
        const image = await pdfDoc.embedJpg(bytes);
        
        page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `images_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error creating PDF: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>JPG to PDF</h2>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
        <label style={{ marginRight: '0.5rem' }}>Page size:</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as keyof typeof PageSizes)}
          style={{ padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '6px', color: 'white' }}
        >
          {Object.keys(PageSizes).map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
        <p>Drop JPG images here or click to browse</p>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {files.length > 0 && (
        <>
          <FilePreview files={files} onRemove={removeFile} onReorder={moveFile} />

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={convertToPdf} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : `📷 Convert ${files.length} Images to PDF`}
          </button>
        </>
      )}
    </div>
  );
};

export default JpgToPdfTool;