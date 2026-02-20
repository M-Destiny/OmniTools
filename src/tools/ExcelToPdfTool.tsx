import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import FilePreview from '../components/FilePreview';

const ExcelToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
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
        const lines = text.split('\n');
        
        // Create a new PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        let page = pdfDoc.addPage([841.89, 595.28]); // Landscape A4
        const { height } = page.getSize();
        let y = height - 50;
        let rowCount = 0;
        
        // Add header
        page.drawText(file.name, {
          x: 50,
          y: y,
          size: 14,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 30;
        
        // Add rows
        for (const line of lines.slice(0, 50)) {
          if (y < 50) {
            page = pdfDoc.addPage([841.89, 595.28]);
            y = height - 50;
            rowCount = 0;
          }
          
          const cleanedLine = line.trim().slice(0, 100);
          if (cleanedLine) {
            const cells = cleanedLine.split(',').map(cell => cell.trim());
            let x = 50;
            for (const cell of cells.slice(0, 8)) {
              page.drawText(cell.slice(0, 15), {
                x: x,
                y: y,
                size: 8,
                font: font,
                color: rgb(0, 0, 0),
              });
              x += 90;
            }
            y -= 12;
            rowCount++;
          }
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
      <h2 style={{ marginBottom: '1rem' }}>Excel to PDF</h2>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Supports: .csv (Converts tabular data to PDF)</p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
        <p>Drop spreadsheets here or click to browse</p>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {files.length > 0 && (
        <>
          <FilePreview files={files} onRemove={removeFile} />

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={convertToPdf} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : `📈 Convert ${files.length} to PDF`}
          </button>
        </>
      )}
    </div>
  );
};

export default ExcelToPdfTool;