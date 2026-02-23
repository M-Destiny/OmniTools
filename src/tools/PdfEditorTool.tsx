import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  pageNumber: number;
  isBold: boolean;
  isItalic: boolean;
}

interface PDFPageInfo {
  pageNum: number;
  thumbnail: string;
}

const SNAP_GRID_SIZE = 10;

const snapToGrid = (value: number): number => {
  return Math.round(value / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
};

const PdfEditorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [thumbnails, setThumbnails] = useState<PDFPageInfo[]>([]);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [gridSnap, setGridSnap] = useState(true);
  const [pdfScale, setPdfScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      try {
        setError('');
        const arrayBuffer = await file.arrayBuffer();
        
        // Load with pdf.js
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPageNumber(1);
        setTextElements([]);
        setThumbnails([]);

        // Generate thumbnails
        generateThumbnails(pdf);
        
        // Render first page
        renderPage(pdf, 1);
      } catch (err) {
        setError('Error loading PDF: ' + (err as Error).message);
      }
    };

    loadPdf();
  }, [file]);

  // Generate thumbnails for all pages
  const generateThumbnails = async (pdf: pdfjsLib.PDFDocumentProxy) => {
    const thumbs: PDFPageInfo[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ 
        canvasContext: ctx, 
        viewport,
        canvas: canvas
      } as any).promise;
        thumbs.push({
          pageNum: i,
          thumbnail: canvas.toDataURL()
        });
      }
    }
    
    setThumbnails(thumbs);
  };

  // Render PDF page to canvas
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const displayScale = Math.min(800 / viewport.width, 1) * zoom;
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
      
      setPdfScale(displayScale / 1.5);
      setPageDimensions({ width: viewport.width, height: viewport.height });
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  // Re-render when page or zoom changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNumber);
    }
  }, [pageNumber, pdfDoc, zoom]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setTextElements([]);
      setPageNumber(1);
      setZoom(1);
    }
  };

  // Add new text element
  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: pageDimensions.width / 2,
      y: pageDimensions.height / 2,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Helvetica',
      pageNumber: pageNumber,
      isBold: false,
      isItalic: false,
    };
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update text element
  const updateElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(elements => 
      elements.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  // Delete text element
  const deleteElement = (id: string) => {
    setTextElements(elements => elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Handle element dragging
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = textElements.find(el => el.id === elementId);
    if (!element || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    setDragStart({
      x: e.clientX - rect.left - element.x * pdfScale,
      y: e.clientY - rect.top - element.y * pdfScale
    });
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - dragStart.x) / pdfScale;
    const mouseY = (e.clientY - rect.top - dragStart.y) / pdfScale;
    
    const finalX = gridSnap ? snapToGrid(Math.max(0, Math.min(mouseX, pageDimensions.width - 50))) : Math.max(0, mouseX);
    const finalY = gridSnap ? snapToGrid(Math.max(0, Math.min(mouseY, pageDimensions.height - 20))) : Math.max(0, mouseY);
    
    updateElement(selectedElement, { x: finalX, y: finalY });
  }, [isDragging, selectedElement, dragStart, pdfScale, pageDimensions, gridSnap]);

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Handle canvas click to deselect
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Save PDF with text
  const savePdf = async () => {
    if (!file || textElements.length === 0) {
      setError('Add some text to the PDF before saving');
      return;
    }

    setEditing(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocLib = await PDFDocument.load(arrayBuffer);
      const pages = pdfDocLib.getPages();
      
      // Group text elements by page
      const elementsByPage: { [key: number]: TextElement[] } = {};
      textElements.forEach(el => {
        if (!elementsByPage[el.pageNumber]) {
          elementsByPage[el.pageNumber] = [];
        }
        elementsByPage[el.pageNumber].push(el);
      });
      
      // Helper function to convert hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
      };
      
      // Add text to each page
      for (const [pageNum, elements] of Object.entries(elementsByPage)) {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex >= pages.length) continue;
        
        const page = pages[pageIndex];
        
        for (const element of elements) {
          const rgbColor = hexToRgb(element.color);
          
          let fontName = element.fontFamily;
          if (element.isBold && element.isItalic) {
            fontName += '-BoldOblique';
          } else if (element.isBold) {
            fontName += '-Bold';
          } else if (element.isItalic) {
            fontName += '-Oblique';
          }
          
          const fontKey = fontName as keyof typeof StandardFonts;
          const font = await pdfDocLib.embedFont(StandardFonts[fontKey] || StandardFonts.Helvetica);
          
          page.drawText(element.text, {
            x: element.x,
            y: element.y,
            size: element.fontSize,
            font: font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          });
        }
      }

      const savedBytes = await pdfDocLib.save();
      const uint8Array = new Uint8Array(savedBytes);
      const blob = new Blob([uint8Array.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Error saving PDF: ' + (err as Error).message);
    } finally {
      setEditing(false);
    }
  };

  const selectedElementData = textElements.find(el => el.id === selectedElement);
  const currentPageElements = textElements.filter(el => el.pageNumber === pageNumber);

  const fontOptions = [
    { name: 'Helvetica', label: 'Helvetica' },
    { name: 'Helvetica-Bold', label: 'Helvetica Bold' },
    { name: 'Times-Roman', label: 'Times New Roman' },
    { name: 'Times-Bold', label: 'Times New Roman Bold' },
    { name: 'Courier', label: 'Courier' },
    { name: 'Courier-Bold', label: 'Courier Bold' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.75rem', background: 'linear-gradient(135deg, #9ebc9e, #ffafc5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        📝 PDF Editor
      </h2>
      
      {/* File Upload */}
      {!file && (
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📄</div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Drop PDF here or click to browse
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Supports multi-page PDFs
          </p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>
      )}

      {file && (
        <>
          {/* Toolbar */}
          <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>📄</span>
              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
            </div>
            
            <div style={{ flex: 1 }} />
            
            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ➖
              </button>
              <span style={{ minWidth: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ➕
              </button>
            </div>

            {/* Grid Snap Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={gridSnap}
                onChange={(e) => setGridSnap(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
              />
              Snap to Grid
            </label>

            {/* Thumbnails Toggle */}
            <button 
              onClick={() => setShowThumbnails(!showThumbnails)}
              style={{ padding: '0.5rem 1rem', background: showThumbnails ? 'var(--color-accent)' : 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: showThumbnails ? 'var(--color-dark)' : 'var(--text-primary)', cursor: 'pointer' }}
            >
              {showThumbnails ? '👁️ Hide Thumbnails' : '🖼️ Show Thumbnails'}
            </button>

            {/* Add Text Button */}
            <button 
              onClick={addTextElement}
              style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #9ebc9e, #7da67d)', border: 'none', borderRadius: '8px', color: '#1a1625', fontWeight: 600, cursor: 'pointer' }}
            >
              ➕ Add Text
            </button>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Thumbnails Sidebar */}
            {showThumbnails && (
              <div 
                ref={thumbnailContainerRef}
                style={{ 
                  width: '120px', 
                  flexShrink: 0,
                  height: 'fit-content',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
                  Pages
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {thumbnails.map((thumb) => (
                    <div
                      key={thumb.pageNum}
                      onClick={() => setPageNumber(thumb.pageNum)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `2px solid ${pageNumber === thumb.pageNum ? 'var(--color-highlight)' : 'transparent'}`,
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={thumb.thumbnail} 
                        alt={`Page ${thumb.pageNum}`}
                        style={{ width: '100%', display: 'block' }}
                      />
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        background: pageNumber === thumb.pageNum ? 'var(--color-highlight)' : 'rgba(0,0,0,0.6)',
                        color: pageNumber === thumb.pageNum ? 'white' : 'white',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        padding: '2px'
                      }}>
                        {thumb.pageNum}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Preview Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Page Navigation */}
              <div className="page-nav" style={{ justifyContent: 'center' }}>
                <button 
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  ◀ Prev
                </button>
                <span style={{ minWidth: '120px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Page {pageNumber} of {totalPages}
                </span>
                <button 
                  onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                  disabled={pageNumber >= totalPages}
                >
                  Next ▶
                </button>
              </div>

              {/* PDF Canvas */}
              <div 
                className="preview-container"
                style={{ 
                  position: 'relative', 
                  overflow: 'auto',
                  maxHeight: '600px',
                  textAlign: 'center'
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="preview-canvas"
                  style={{ 
                    display: 'inline-block',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onClick={handleCanvasClick}
                />
                
                {/* Render text elements */}
                {currentPageElements.map(element => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: element.x * pdfScale,
                      top: element.y * pdfScale,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      padding: '4px 8px',
                      backgroundColor: selectedElement === element.id ? 'rgba(224, 71, 158, 0.2)' : 'transparent',
                      border: selectedElement === element.id ? '2px dashed var(--color-highlight)' : '2px solid transparent',
                      borderRadius: '4px',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transform: `scale(${pdfScale})`,
                      transformOrigin: 'top left',
                    }}
                    onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                  >
                    <span style={{ 
                      color: element.color, 
                      fontSize: `${element.fontSize}px`,
                      fontFamily: element.fontFamily,
                      fontWeight: element.isBold ? 'bold' : 'normal',
                      fontStyle: element.isItalic ? 'italic' : 'normal',
                    }}>
                      {element.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Elements List */}
              {textElements.length > 0 && (
                <div className="panel" style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Text Elements ({textElements.length}) - Click to edit
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {textElements.map((el) => (
                      <button
                        key={el.id}
                        onClick={() => {
                          setPageNumber(el.pageNumber);
                          setSelectedElement(el.id);
                        }}
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: selectedElement === el.id ? 'var(--color-highlight)' : 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: selectedElement === el.id ? 'white' : 'var(--text-primary)',
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        📝 {el.text.slice(0, 12)}{el.text.length > 12 ? '...' : ''} (p.{el.pageNumber})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Editor Panel */}
              {selectedElement && selectedElementData && (
                <div className="panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-accent)' }}>
                    <span>✏️ Edit Text</span>
                    <button 
                      onClick={() => deleteElement(selectedElement)}
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        background: 'linear-gradient(135deg, #ff6b8a, #ee4a62)', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        color: 'white', 
                        fontSize: '0.85rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Text Content:</label>
                      <input 
                        type="text" 
                        value={selectedElementData.text}
                        onChange={(e) => updateElement(selectedElement, { text: e.target.value })}
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem', 
                          backgroundColor: 'var(--bg-input)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '8px', 
                          color: 'var(--text-primary)',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Font Size:</label>
                        <input 
                          type="number" 
                          value={selectedElementData.fontSize}
                          onChange={(e) => updateElement(selectedElement, { fontSize: Number(e.target.value) })}
                          min={6}
                          max={200}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: 'var(--bg-input)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Color:</label>
                        <input 
                          type="color" 
                          value={selectedElementData.color}
                          onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                          style={{ 
                            width: '100%', 
                            height: '46px', 
                            cursor: 'pointer',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-input)'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Font Family:</label>
                      <select 
                        value={selectedElementData.fontFamily}
                        onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem', 
                          backgroundColor: 'var(--bg-input)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '8px', 
                          color: 'var(--text-primary)'
                        }}
                      >
                        {fontOptions.map(font => (
                          <option key={font.name} value={font.name}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedElementData.isBold}
                          onChange={(e) => updateElement(selectedElement, { isBold: e.target.checked })}
                          style={{ width: '20px', height: '20px', accentColor: 'var(--color-highlight)' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>Bold</span>
                      </label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedElementData.isItalic}
                          onChange={(e) => updateElement(selectedElement, { isItalic: e.target.checked })}
                          style={{ width: '20px', height: '20px', accentColor: 'var(--color-highlight)' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>Italic</span>
                      </label>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>X Position:</label>
                        <input 
                          type="number" 
                          value={Math.round(selectedElementData.x)}
                          onChange={(e) => updateElement(selectedElement, { x: Number(e.target.value) })}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: 'var(--bg-input)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Y Position:</label>
                        <input 
                          type="number" 
                          value={Math.round(selectedElementData.y)}
                          onChange={(e) => updateElement(selectedElement, { y: Number(e.target.value) })}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: 'var(--bg-input)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p style={{ color: 'var(--color-error)', padding: '1rem', background: 'rgba(255,107,138,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                  ⚠️ {error}
                </p>
              )}

              {/* Save Button */}
              <button 
                onClick={savePdf} 
                disabled={editing || textElements.length === 0}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '1rem',
                  fontSize: '1.1rem',
                  opacity: editing || textElements.length === 0 ? 0.6 : 1,
                  cursor: textElements.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {editing ? '⏳ Saving PDF...' : '💾 Save PDF'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfEditorTool;
