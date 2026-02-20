import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

const PdfMergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
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

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setMerging(true);
    setError('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const fileArrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error merging PDFs: ' + (err as Error).message);
    } finally {
      setMerging(false);
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
      <h2 style={{ marginBottom: '1rem' }}>Merge Multiple PDFs</h2>
      
      <div
        style={dropZoneStyle}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6'; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#475569';
          const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
          setFiles(prev => [...prev, ...droppedFiles]);
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
        <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          <strong>Drop PDF files here</strong> or click to browse
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Select 2 or more PDF files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Files to merge ({files.length}):</h3>
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
                  <span style={{ marginRight: '0.5rem' }}>📄</span>
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
            onClick={mergePDFs}
            disabled={merging || files.length < 2}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.875rem',
              backgroundColor: files.length < 2 ? '#334155' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: files.length < 2 ? 'default' : 'pointer',
              opacity: files.length < 2 ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {merging ? '⏳ Merging...' : `🔗 Merge ${files.length} PDFs`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfMergeTool;