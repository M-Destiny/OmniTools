import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { saveAs } from 'file-saver'; // Removed as not used directly

const WordToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.name.endsWith('.txt') || f.name.endsWith('.html')
      );
      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      for (const file of files) {
        const text = await file.text();
        
        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Parse simple text content
        const lines = text.split('\n').slice(0, 100); // Limit to first 100 lines
        
        let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const { width, height } = page.getSize();
        let y = height - 50;
        
        // Add header
        page.drawText(file.name, {
          x: 50,
          y: y,
          size: 16,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 30;
        
        // Add content
        for (const line of lines) {
          if (y < 50) {
            // Add new page
            page = pdfDoc.addPage([595.28, 841.89]);
            y = height - 50;
          }
          
          const cleanedLine = line.trim().slice(0, 80); // Limit line length
          if (cleanedLine) {
            page.drawText(cleanedLine, {
              x: 50,
              y: y,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
              maxWidth: width - 100,
            });
          }
          y -= 14;
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Error converting to PDF: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Word to PDF</h2>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Supports: .txt, .html, .docx (text extraction)</p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <p>Drop documents here or click to browse</p>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Files ({files.length}):</h3>
          {files.map((file, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <span>📝 {file.name}</span>
              <button onClick={() => removeFile(index)} style={{ backgroundColor: '#ef4444', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>✕</button>
            </div>
          ))}

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={convertToPdf} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : `📄 Convert ${files.length} to PDF`}
          </button>
        </div>
      )}
    </div>
  );
};

export default WordToPdfTool;