import React, { useState, useRef } from 'react';
import FilePreview from '../components/FilePreview';

const ImageCompressTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [quality, setQuality] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

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

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, file.type, quality / 100);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const compressAll = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setCompressing(true);
    setError('');

    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        const url = URL.createObjectURL(compressed);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_${file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Error compressing images: ' + (err as Error).message);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Compress Images</h2>
      
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quality: {quality}%</label>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗜️</div>
        <p>Drop images here or click to browse</p>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {files.length > 0 && (
        <>
          <FilePreview files={files} onRemove={removeFile} />

          {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}

          <button onClick={compressAll} disabled={compressing} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {compressing ? '⏳ Compressing...' : `🗜️ Compress ${files.length} Image(s)`}
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCompressTool;