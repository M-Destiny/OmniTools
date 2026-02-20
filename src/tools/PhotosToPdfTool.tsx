import React, { useState, useRef } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';

const PhotosToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [pageSize, setPageSize] = useState<keyof typeof PageSizes>('A4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

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

  const imageToPdf = async (imageFile: File, pdfDoc: PDFDocument, pageSize: keyof typeof PageSizes) => {
    const img = await loadImage(imageFile);
    const pageDims = PageSizes[pageSize];
    const page = pdfDoc.addPage(pageDims);
    
    const { width: pageWidth, height: pageHeight } = page.getSize();
    
    // Calculate scale to fit image on page while maintaining aspect ratio
    const scale = Math.min(
      (pageWidth - 40) / img.width,
      (pageHeight - 40) / img.height
    );
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    let image;
    const bytes = await imageFile.arrayBuffer();
    
    if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(bytes);
    } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(bytes);
    } else {
      // For other formats, convert using canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const pngData = await new Promise<Uint8Array>((resolve) => {
        canvas.toBlob(async (blob) => {
          const arrayBuffer = await blob!.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        }, 'image/png');
      });
      image = await pdfDoc.embedPng(pngData);
    }
    
    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        await imageToPdf(file, pdfDoc, pageSize);
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
      setError('Error converting images: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  const dropZoneStyle: React.CSSProperties = {
    border: '2px dashed #475569',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    transition: 'all 0.2s ease',
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Convert Photos to PDF</h2>
      
      <div
        style={dropZoneStyle}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#10b981'; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#475569';
          const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
            validImageTypes.includes(f.type)
          );
          setFiles(prev => [...prev, ...droppedFiles]);
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
        <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          <strong>Drop images here</strong> or click to browse
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Supports: JPG, PNG, GIF, WebP, BMP</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '0.75rem' 
          }}>
            <h3>Images ({files.length}):</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Page size:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as keyof typeof PageSizes)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              >
                {Object.keys(PageSizes).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                <span style={{ flex: 1, fontSize: '0.9rem' }}>
                  <span style={{ marginRight: '0.5rem' }}>🖼️</span>
                  {file.name}
                  <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: index === 0 ? '#334155' : '#475569',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: index === 0 ? 'default' : 'pointer',
                      opacity: index === 0 ? 0.5 : 1,
                      fontSize: '0.9rem',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: index === files.length - 1 ? '#334155' : '#475569',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: index === files.length - 1 ? 'default' : 'pointer',
                      opacity: index === files.length - 1 ? 0.5 : 1,
                      fontSize: '0.9rem',
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#ef4444',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>
          )}

          <button
            onClick={convertToPdf}
            disabled={converting || files.length === 0}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.875rem',
              backgroundColor: files.length === 0 ? '#334155' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: files.length === 0 ? 'default' : 'pointer',
              opacity: files.length === 0 ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {converting ? '⏳ Converting...' : `🖼️ Convert ${files.length} Image${files.length !== 1 ? 's' : ''} to PDF`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotosToPdfTool;