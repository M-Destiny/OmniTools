import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

const PdfCompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const compressPdf = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setCompressing(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Remove unused objects and compress
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error compressing PDF: ' + (err as Error).message);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Compress PDF</h2>
      
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
          <p>📄 {file.name}</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Original size: {(file.size / 1024).toFixed(1)} KB</p>

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={compressPdf} disabled={compressing} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {compressing ? '⏳ Compressing...' : '📉 Compress PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfCompressTool;