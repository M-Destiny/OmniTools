import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configure pdf.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>({ x: 100, y: 200 });
  const [pdfScale, setPdfScale] = useState(1);
  
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
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        
        if (pageNumber > pdf.numPages) {
          setPageNumber(1);
        }
        
        renderPage(pdf, pageNumber);
      } catch (err) {
        setError('Error loading PDF: ' + (err as Error).message);
      }
    };
    
    loadPdf();
  }, [file]);

  // Re-render page when page number changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNumber);
    }
  }, [pageNumber, pdfDoc]);

  // Render PDF page to canvas
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      
      const displayScale = Math.min(600 / viewport.width, 1);
      const scaledViewport = page.getViewport({ scale: displayScale });
      
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({ 
        canvasContext: ctx, 
        viewport: scaledViewport,
        canvas: canvas
      } as any).promise;
      
      setPdfScale(displayScale);
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
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
    ctx.strokeStyle = '#553e4e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
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
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    setSignaturePosition({
      x: Math.max(0, newX / pdfScale),
      y: Math.max(0, (canvas.height - newY) / pdfScale)
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
      const pdfDocLib = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDocLib.getPages();
      if (pageNumber > pages.length) {
        setError(`PDF only has ${pages.length} pages`);
        setSigning(false);
        return;
      }
      
      const page = pages[pageNumber - 1];
      const { width, height } = page.getSize();
      const font = await pdfDocLib.embedFont(StandardFonts.Helvetica);

      // Add signature text
      if (signatureText) {
        page.drawText(signatureText, {
          x: Math.max(0, Math.min(signaturePosition.x, width - 100)),
          y: Math.max(0, Math.min(signaturePosition.y, height - 30)),
          size: 20,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      // Add signature image if available
      if (signatureImage) {
        const base64Data = signatureImage.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        try {
          const embeddedImage = await pdfDocLib.embedPng(imageBytes);
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

      const signedBytes = await pdfDocLib.save();
      const uint8Array = new Uint8Array(signedBytes);
      const blob = new Blob([uint8Array.buffer], { type: 'application/pdf' });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.75rem', background: 'linear-gradient(135deg, #9ebc9e, #ffafc5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        ✍️ Sign PDF
      </h2>
      
      {!file && (
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✍️</div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Drop PDF here or click to browse
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Upload a PDF document to sign
          </p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>
      )}

      {file && (
        <>
          {/* File Info & Controls */}
          <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>📄</span>
              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page:</label>
              <input 
                type="number" 
                value={pageNumber}
                onChange={(e) => setPageNumber(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                min={1}
                max={totalPages}
                style={{ 
                  width: '60px', 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  color: 'var(--text-primary)',
                  textAlign: 'center'
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>of {totalPages}</span>
            </div>
          </div>

          {/* Signature Input Panel */}
          <div className="panel">
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-accent)', fontSize: '1.1rem' }}>
              🖊️ Create Your Signature
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Type your signature:
              </label>
              <input 
                type="text" 
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Type your name or signature text..."
                style={{ 
                  width: '100%', 
                  padding: '0.875rem', 
                  backgroundColor: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontFamily: 'cursive'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Or draw your signature:
              </label>
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  width={350}
                  height={120}
                  onMouseDown={startDrawing}
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    backgroundColor: 'white', 
                    cursor: 'crosshair',
                    width: '100%',
                    maxWidth: '350px'
                  }}
                />
                <button 
                  onClick={clearCanvas} 
                  style={{ 
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '0.25rem 0.5rem', 
                    backgroundColor: 'rgba(255,107,138,0.9)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {signatureImage && (
              <div style={{ padding: '0.75rem', background: 'rgba(158, 188, 158, 0.1)', borderRadius: '8px', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>✓ Signature drawn</span>
              </div>
            )}
          </div>

          {/* PDF Preview with Signature Placement */}
          <div className="panel">
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-accent)', fontSize: '1.1rem' }}>
              📍 Position Your Signature
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Drag the signature box to position it on the document
            </p>
            
            <div 
              ref={containerRef}
              style={{ 
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-input)',
                display: 'inline-block',
                width: '100%',
                overflowX: 'auto'
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
                    left: signaturePosition.x * pdfScale,
                    top: signaturePosition.y * pdfScale,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    padding: '8px',
                    backgroundColor: 'rgba(224, 71, 158, 0.15)',
                    border: '2px dashed var(--color-highlight)',
                    borderRadius: '8px',
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
                    <span style={{ color: '#553e4e', fontSize: '18px', fontFamily: 'cursive' }}>
                      {signatureText}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Position inputs */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>X Position:</label>
                <input 
                  type="number" 
                  value={Math.round(signaturePosition.x)}
                  onChange={(e) => setSignaturePosition({ ...signaturePosition, x: Number(e.target.value) })}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'var(--bg-input)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Y Position:</label>
                <input 
                  type="number" 
                  value={Math.round(signaturePosition.y)}
                  onChange={(e) => setSignaturePosition({ ...signaturePosition, y: Number(e.target.value) })}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'var(--bg-input)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '6px', 
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--color-error)', padding: '1rem', background: 'rgba(255,107,138,0.1)', borderRadius: '8px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          <button 
            onClick={signPdf} 
            disabled={signing || (!signatureText && !signatureImage)} 
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem',
              fontSize: '1.1rem',
              opacity: (!signatureText && !signatureImage) ? 0.6 : 1,
              cursor: (!signatureText && !signatureImage) ? 'not-allowed' : 'pointer'
            }}
          >
            {signing ? '⏳ Signing PDF...' : '✍️ Sign PDF'}
          </button>
        </>
      )}
    </div>
  );
};

export default PdfSignTool;
