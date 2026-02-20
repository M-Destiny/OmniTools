import React, { useState } from 'react';

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (index: number, direction: 'up' | 'down') => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove, onReorder: _onReorder }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isImage = (file: File) => file.type.startsWith('image/');
  const isPDF = (file: File) => file.type === 'application/pdf';

  const getPreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>Files ({files.length}):</h3>
      
      {/* Grid of thumbnails */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => setSelectedIndex(index)}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedIndex === index ? '2px solid #3b82f6' : '2px solid transparent',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              aspectRatio: '1',
            }}
          >
            {isImage(file) && (
              <img 
                src={getPreview(file)} 
                alt={file.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            )}
            {isPDF(file) && (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '0.5rem'
              }}>
                <div style={{ fontSize: '2rem' }}>📄</div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', wordBreak: 'break-all' }}>
                  {file.name.slice(0, 15)}...
                </span>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: 'white',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Selected file preview */}
      {selectedIndex !== null && files[selectedIndex] && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
        }}
        onClick={() => setSelectedIndex(null)}
        >
          <div style={{ maxWidth: '90%', maxHeight: '90%' }}>
            {isImage(files[selectedIndex]) && (
              <img 
                src={getPreview(files[selectedIndex])} 
                alt={files[selectedIndex].name}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '80vh',
                  borderRadius: '8px',
                  objectFit: 'contain'
                }}
              />
            )}
            {isPDF(files[selectedIndex]) && (
              <div style={{ 
                color: 'white', 
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <h3>{files[selectedIndex].name}</h3>
                <p>{(files[selectedIndex].size / 1024).toFixed(1)} KB</p>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
                  PDF preview requires iframe or PDF.js integration
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSelectedIndex(null)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'white',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FilePreview;