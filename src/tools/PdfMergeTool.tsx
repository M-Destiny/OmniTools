import React from 'react';

const PdfMergeTool: React.FC = () => {
  return (
    <div>
      <h2>PDF Merge Tool</h2>
      <p>Upload multiple PDF files and merge them into a single document.</p>
      {/* Placeholder for file inputs and merge logic */}
      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #475569', borderRadius: '8px' }}>
        <p>File upload and merging functionality will go here.</p>
        <input type="file" multiple accept=".pdf" style={{ color: '#f1f5f9', marginTop: '0.5rem' }} />
        <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '1rem'
        }}>Merge PDFs</button>
      </div>
    </div>
  );
};

export default PdfMergeTool;
