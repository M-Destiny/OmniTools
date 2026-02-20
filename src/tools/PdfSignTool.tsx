import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PdfSignTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const position = { x: 100, y: 100 };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    const draw = (e: MouseEvent) => {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    
    const stopDrawing = () => {
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      setSignatureImage(canvas.toDataURL());
    };
    
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureImage(null);
    }
  };

  const signPdf = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setSigning(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      if (pageNumber > pages.length) {
        setError(`PDF only has ${pages.length} pages`);
        setSigning(false);
        return;
      }
      
      const page = pages[pageNumber - 1];
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Add signature text
      if (signatureText) {
        page.drawText(signatureText, {
          x: Math.min(position.x, width - 100),
          y: Math.min(position.y, height - 30),
          size: 14,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      // Add signature image if available
      if (signatureImage) {
        // Remove data URL prefix
        const base64Data = signatureImage.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        try {
          const embeddedImage = await pdfDoc.embedPng(imageBytes);
          page.drawImage(embeddedImage, {
            x: Math.min(position.x, width - 150),
            y: Math.min(position.y - 50, height - 80),
            width: 100,
            height: 50,
          });
        } catch (e) {
          // Image embedding might fail, continue with text only
        }
      }

      // Add timestamp
      page.drawText(`Signed: ${new Date().toLocaleString()}`, {
        x: 50,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      const signedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(signedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Error signing PDF: ' + (err as Error).message);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Sign PDF</h2>
      
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <div style={{ marginTop: '1.5rem' }}>
          <p>📄 {file.name}</p>
          
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
            <label>Signature Text:</label>
            <input 
              type="text" 
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Your signature..."
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
            />
            
            <p style={{ marginTop: '1rem' }}>Draw your signature:</p>
            <canvas
              ref={canvasRef}
              width={300}
              height={100}
              onMouseDown={startDrawing}
              style={{ 
                border: '1px solid #475569', 
                borderRadius: '4px', 
                backgroundColor: 'white', 
                cursor: 'crosshair',
                marginTop: '0.5rem'
              }}
            />
            <button onClick={clearCanvas} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear Signature</button>
            
            <div style={{ marginTop: '1rem' }}>
              <label>Page number:</label>
              <input 
                type="number" 
                value={pageNumber}
                onChange={(e) => setPageNumber(Number(e.target.value))}
                min={1}
                style={{ width: '60px', padding: '0.5rem', marginLeft: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={signPdf} disabled={signing} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {signing ? '⏳ Signing...' : '✍️ Sign PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfSignTool;