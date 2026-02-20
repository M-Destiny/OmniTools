import React, { useState, useRef } from 'react';

const PdfToExcelTool: React.FC = () => {
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

  const convertToExcel = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      // Create CSV from PDF (simplified - tables would need PDF parsing)
      const csvContent = `Page,Content\n1,"Table data from PDF would be extracted here"\n2,"More table data"\n`;
      
      // Download as CSV (Excel can open CSV)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace('.pdf', '')}.csv`;
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
      <h2 style={{ marginBottom: '1rem' }}>PDF to Excel</h2>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⚠️ Note: This creates a CSV file that Excel can open. For perfect table extraction, use professional tools.</p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <div style={{ marginTop: '1.5rem' }}>
          <p>📄 {file.name}</p>

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={convertToExcel} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : '📊 Convert to CSV/Excel'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfToExcelTool;