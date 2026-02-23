import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

interface PDFFontInfo {
  name: string;
  isBold: boolean;
  isItalic: boolean;
}

const PdfEditorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [availableFonts] = useState<PDFFontInfo[]>([
    { name: 'Helvetica', isBold: false, isItalic: false },
    { name: 'Helvetica-Bold', isBold: true, isItalic: false },
    { name: 'Helvetica-Oblique', isBold: false, isItalic: true },
    { name: 'Helvetica-BoldOblique', isBold: true, isItalic: true },
    { name: 'Times-Roman', isBold: false, isItalic: false },
    { name: 'Times-Bold', isBold: true, isItalic: false },
    { name: 'Times-Italic', isBold: false, isItalic: true },
    { name: 'Times-BoldItalic', isBold: true, isItalic: true },
    { name: 'Courier', isBold: false, isItalic: false },
    { name: 'Courier-Bold', isBold: true, isItalic: false },
    { name: 'Courier-Oblique', isBold: false, isItalic: true },
    { name: 'Courier-BoldOblique', isBold: true, isItalic: true },
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF
  useEffect(() => {
    if (!file) return;
    
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        setPdfBytes(arrayBuffer);
        
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        setTotalPages(pages.length);
        setPageNumber(1);
        setTextElements([]);
        
        // Render the current page
        renderPage(arrayBuffer, 1);
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

  // Render PDF page to canvas
  const renderPage = async (arrayBuffer: ArrayBuffer, pageNum: number) => {
    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      if (pageNum > pages.length) return;
      
      const page = pages[pageNum - 1];
      const { width, height } = page.getSize();
      
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      
      const scale = Math.min(600 / width, 1);
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      (canvas as any).pdfScale = scale;
      (canvas as any).pdfHeight = height;
      (canvas as any).pdfWidth = width;
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
      setTextElements([]);
      setPageNumber(1);
    }
  };

  // Add new text element
  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: 100,
      y: 300,
      fontSize: 16,
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
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = textElements.find(el => el.id === elementId);
    if (!element) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const scale = (canvas as any).pdfScale || 1;
    const rect = canvas.getBoundingClientRect();
    
    setDragStart({
      x: (e.clientX - rect.left) / scale - element.x,
      y: (canvas.height - (e.clientY - rect.top) / scale) - element.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const scale = (canvas as any).pdfScale || 1;
    const pdfHeight = (canvas as any).pdfHeight || 500;
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = pdfHeight - (e.clientY - rect.top) / scale;
    
    updateElement(selectedElement, {
      x: Math.max(0, mouseX - dragStart.x),
      y: Math.max(0, mouseY - dragStart.y)
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
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
          
          // Get the font
          let fontName = element.fontFamily;
          if (element.isBold && element.isItalic) {
            fontName += '-BoldOblique';
          } else if (element.isBold) {
            fontName += '-Bold';
          } else if (element.isItalic) {
            fontName += '-Oblique';
          }
          
          const fontKey = fontName as keyof typeof StandardFonts;
          const font = await pdfDoc.embedFont(StandardFonts[fontKey] || StandardFonts.Helvetica);
          
          page.drawText(element.text, {
            x: element.x,
            y: element.y,
            size: element.fontSize,
            font: font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          });
        }
      }

      const savedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' });
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

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>📝 PDF Editor</h2>
      
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
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <div style={{ marginTop: '1.5rem' }}>
          <p>📄 {file.name}</p>
          
          {/* Page Navigation */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
            <button 
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
            >
              ◀
            </button>
            <span>Page {pageNumber} of {totalPages}</span>
            <button 
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
              disabled={pageNumber >= totalPages}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
            >
              ▶
            </button>
            
            <button 
              onClick={addTextElement}
              style={{ marginLeft: 'auto', padding: '0.5rem 1rem', backgroundColor: '#10b981', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
            >
              + Add Text
            </button>
          </div>

          {/* PDF Preview */}
          <div 
            ref={containerRef}
            style={{ 
              marginTop: '1rem',
              position: 'relative',
              border: '2px solid #475569',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#1e293b',
              display: 'inline-block',
              width: '100%'
            }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{ display: 'block', maxWidth: '100%' }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
            
            {/* Render text elements */}
            {textElements
              .filter(el => el.pageNumber === pageNumber)
              .map(element => (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: (previewCanvasRef.current ? (element.x / ((previewCanvasRef.current as any).pdfWidth || 500)) * previewCanvasRef.current.width : 0),
                    top: (previewCanvasRef.current ? (1 - element.y / ((previewCanvasRef.current as any).pdfHeight || 500)) * previewCanvasRef.current.height - element.fontSize : 0),
                    cursor: isDragging ? 'grabbing' : 'grab',
                    padding: '4px 8px',
                    backgroundColor: selectedElement === element.id ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                    border: selectedElement === element.id ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '4px',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                >
                  <span style={{ 
                    color: element.color, 
                    fontSize: `${element.fontSize * ((previewCanvasRef.current as any).pdfScale || 1) * 0.75}px`,
                    fontFamily: element.fontFamily,
                    fontWeight: element.isBold ? 'bold' : 'normal',
                    fontStyle: element.isItalic ? 'italic' : 'normal',
                  }}>
                    {element.text}
                  </span>
                </div>
              ))}
          </div>

          {/* Text Editor Panel */}
          {selectedElement && selectedElementData && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Edit Text
                <button 
                  onClick={() => deleteElement(selectedElement)}
                  style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontSize: '0.8rem' }}
                >
                  🗑️ Delete
                </button>
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>Text:</label>
                  <input 
                    type="text" 
                    value={selectedElementData.text}
                    onChange={(e) => updateElement(selectedElement, { text: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>Font Size:</label>
                    <input 
                      type="number" 
                      value={selectedElementData.fontSize}
                      onChange={(e) => updateElement(selectedElement, { fontSize: Number(e.target.value) })}
                      min={6}
                      max={200}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>Color:</label>
                    <input 
                      type="color" 
                      value={selectedElementData.color}
                      onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                      style={{ width: '100%', height: '38px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>Font:</label>
                  <select 
                    value={selectedElementData.fontFamily}
                    onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                  >
                    {availableFonts.map(font => (
                      <option key={font.name} value={font.name}>
                        {font.name.replace(/-/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedElementData.isBold}
                      onChange={(e) => updateElement(selectedElement, { isBold: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.9rem' }}>Bold</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedElementData.isItalic}
                      onChange={(e) => updateElement(selectedElement, { isItalic: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.9rem' }}>Italic</span>
                  </label>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>X Position:</label>
                    <input 
                      type="number" 
                      value={Math.round(selectedElementData.x)}
                      onChange={(e) => updateElement(selectedElement, { x: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#94a3b8' }}>Y Position:</label>
                    <input 
                      type="number" 
                      value={Math.round(selectedElementData.y)}
                      onChange={(e) => updateElement(selectedElement, { y: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Elements list */}
          {textElements.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Text Elements ({textElements.length}):</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {textElements.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => {
                      setPageNumber(el.pageNumber);
                      setSelectedElement(el.id);
                    }}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: selectedElement === el.id ? '#3b82f6' : '#475569',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '0.8rem'
                    }}
                  >
                    {el.text.slice(0, 15)}{el.text.length > 15 ? '...' : ''} (p.{el.pageNumber})
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}

          <button 
            onClick={savePdf} 
            disabled={editing || textElements.length === 0}
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              backgroundColor: textElements.length === 0 ? '#334155' : '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              marginTop: '1rem',
              cursor: textElements.length === 0 ? 'default' : 'pointer',
              opacity: textElements.length === 0 ? 0.6 : 1
            }}
          >
            {editing ? '⏳ Saving...' : '💾 Save PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfEditorTool;
