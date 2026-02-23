import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface SignaturePosition {
  x: number;
  y: number;
}

const PdfSignTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>({ x: 100, y: 200 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF and render page
  useEffect(() => {
    if (!file) return;
    
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        setPdfBytes(arrayBuffer);
        
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        setTotalPages(pages.length);
        
        if (pageNumber > pages.length) {
          setPageNumber(1);
        }
        
        // Render the current page
        renderPage(arrayBuffer, pageNumber);
      } catch (err) {
        setError('Error loading PDF: ' + (err as Error).message);
      }
    };
    
    loadPdf();
  }, [file]);

  // Re-render page when page number changes
  useEffect(() => {
    if (pdfBytes) {
      renderPage(pdfBytes, pageNumber);
    }
  }, [pageNumber, pdfBytes]);

  // Render PDF page to canvas (simplified - shows first page content)
  const renderPage = async (arrayBuffer: ArrayBuffer, pageNum: number) => {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      if (pageNum > pages.length) return;
      
      const page = pages[pageNum - 1];
      const { width, height } = page.getSize();
      
      // Set canvas size
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      
      // Scale for display (max 600px width)
      const scale = Math.min(600 / width, 1);
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw page border
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Store scale for positioning
      (canvas as any).pdfScale = scale;
      (canvas as any).pdfHeight = height;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSignatureImage(null);
      setSignatureText('');
      setPageNumber(1);
      setSignaturePosition({ x: 100, y: 200 });
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

  // Handle signature positioning on the PDF preview
  const handleSignatureDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!signatureImage && !signatureText) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleSignatureDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Convert to PDF coordinates (invert Y)
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const scale = (canvas as any).pdfScale || 1;
    
    setSignaturePosition({
      x: Math.max(0, newX / scale),
      y: Math.max(0, (canvas.height - newY / scale - 50))
    });
  };

  const handleSignatureDragEnd = () => {
    setIsDragging(false);
  };

  const signPdf = async () => {
    if (!file || (!signatureText && !signatureImage)) {
      setError('Please add a signature (text or drawing)');
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
          x: Math.max(0, Math.min(signaturePosition.x, width - 100)),
          y: Math.max(0, Math.min(signaturePosition.y, height - 30)),
          size: 14,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      // Add signature image if available
      if (signatureImage) {
        const base64Data = signatureImage.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        try {
          const embeddedImage = await pdfDoc.embedPng(imageBytes);
          const imgDims = embeddedImage.scale(0.5);
          page.drawImage(embeddedImage, {
            x: Math.max(0, Math.min(signaturePosition.x, width - 150)),
            y: Math.max(0, Math.min(signaturePosition.y - 50, height - 80)),
            width: imgDims.width,
            height: imgDims.height,
          });
        } catch (e) {
          console.error('Image embedding error:', e);
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
            <button onClick={clearCanvas} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>Clear Signature</button>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label>Page:</label>
              <input 
                type="number" 
                value={pageNumber}
                onChange={(e) => setPageNumber(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                min={1}
                max={totalPages}
                style={{ width: '60px', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
              />
              <span style={{ color: '#94a3b8' }}>of {totalPages}</span>
            </div>
          </div>

          {/* PDF Preview with Signature Placement */}
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>📍 Position your signature on the PDF:</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Drag the signature to position it, or use the text input</p>
            
            <div 
              ref={containerRef}
              style={{ 
                position: 'relative',
                border: '2px solid #475569',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#1e293b',
                display: 'inline-block'
              }}
            >
              <canvas
                ref={previewCanvasRef}
                style={{ display: 'block', maxWidth: '100%' }}
              />
              
              {/* Draggable signature overlay */}
              {(signatureImage || signatureText) && (
                <div
                  style={{
                    position: 'absolute',
                    left: signaturePosition.x * ((previewCanvasRef.current?.width || 600) / (previewCanvasRef.current ? (previewCanvasRef.current as any).pdfHeight * (previewCanvasRef.current as any).pdfScale || 600 : 600) * ((previewCanvasRef.current as any).pdfScale || 1)),
                    top: previewCanvasRef.current ? previewCanvasRef.current.height - (signaturePosition.y * ((previewCanvasRef.current as any).pdfScale || 1)) - 50 : 0,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    padding: '4px',
                    backgroundColor: 'rgba(139, 92, 246, 0.3)',
                    border: '2px dashed #8b5cf6',
                    borderRadius: '4px',
                    userSelect: 'none',
                  }}
                  onMouseDown={handleSignatureDragStart}
                  onMouseMove={handleSignatureDrag}
                  onMouseUp={handleSignatureDragEnd}
                  onMouseLeave={handleSignatureDragEnd}
                >
                  {signatureImage ? (
                    <img 
                      src={signatureImage} 
                      alt="Signature" 
                      style={{ maxWidth: '150px', maxHeight: '60px', display: 'block' }} 
                    />
                  ) : (
                    <span style={{ color: '#000', fontSize: '14px', fontFamily: 'Helvetica' }}>
                      {signatureText}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Position inputs */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>X Position:</label>
                <input 
                  type="number" 
                  value={Math.round(signaturePosition.x)}
                  onChange={(e) => setSignaturePosition({ ...signaturePosition, x: Number(e.target.value) })}
                  style={{ width: '80px', padding: '0.25rem', marginLeft: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Y Position:</label>
                <input 
                  type="number" 
                  value={Math.round(signaturePosition.y)}
                  onChange={(e) => setSignaturePosition({ ...signaturePosition, y: Number(e.target.value) })}
                  style={{ width: '80px', padding: '0.25rem', marginLeft: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                />
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}

          <button 
            onClick={signPdf} 
            disabled={signing || (!signatureText && !signatureImage)} 
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              backgroundColor: (!signatureText && !signatureImage) ? '#334155' : '#8b5cf6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              marginTop: '1rem',
              cursor: (!signatureText && !signatureImage) ? 'default' : 'pointer',
              opacity: (!signatureText && !signatureImage) ? 0.6 : 1
            }}
          >
            {signing ? '⏳ Signing...' : '✍️ Sign PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfSignTool;
