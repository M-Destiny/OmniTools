import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

const PdfWatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarking, setWatermarking] = useState(false);
  const [error, setError] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [fontSize, setFontSize] = useState(60);
  const [color, setColor] = useState('#808080');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
  };

  const addWatermark = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    if (!watermarkText && !watermarkImage) {
      setError('Please add a text watermark or select an image watermark');
      return;
    }

    setWatermarking(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      let watermarkImg = null;
      if (watermarkImage) {
        const imgBytes = await watermarkImage.arrayBuffer();
        try {
          watermarkImg = await pdfDoc.embedPng(imgBytes);
        } catch {
          try {
            watermarkImg = await pdfDoc.embedJpg(imgBytes);
          } catch {
            // Image embedding failed
          }
        }
      }
      
      const rgbColor = hexToRgb(color);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const centerX = width / 2;
        const centerY = height / 2;

        // Add text watermark
        if (watermarkText) {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          page.drawText(watermarkText, {
            x: centerX - textWidth / 2,
            y: centerY,
            size: fontSize,
            font: font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            rotate: degrees(rotation),
            opacity: opacity,
          });
        }

        // Add image watermark
        if (watermarkImg) {
          const imgDims = watermarkImg.scale(0.5);
          page.drawImage(watermarkImg, {
            x: centerX - imgDims.width / 2,
            y: centerY - imgDims.height / 2,
            width: imgDims.width,
            height: imgDims.height,
            rotate: degrees(rotation),
            opacity: opacity,
          });
        }
      }

      const watermarkedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Error adding watermark: ' + (err as Error).message);
    } finally {
      setWatermarking(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>PDF Watermark</h2>
      
      <div
        style={{
          border: '2px dashed #475569',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          marginBottom: '1rem'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💧</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <>
          <p>📄 {file.name}</p>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Text Watermark:</label>
              <input 
                type="text" 
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, etc."
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', backgroundColor: '#334155', border: '1px solid #475569', borderRadius: '4px', color: 'white' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Image Watermark:</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                >
                  {watermarkImage ? watermarkImage.name : 'Select Image'}
                </button>
                {watermarkImage && (
                  <button 
                    onClick={() => setWatermarkImage(null)}
                    style={{ padding: '0.5rem', backgroundColor: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Color: </label>
              <input 
                type="color" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Opacity: {Math.round(opacity * 100)}%</label>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Rotation: {rotation}°</label>
              <input 
                type="range" 
                min="-90" 
                max="90" 
                step="15"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>

            <div>
              <label>Font Size: {fontSize}px</label>
              <input 
                type="range" 
                min="20" 
                max="120" 
                step="5"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{error}</p>}

          <button onClick={addWatermark} disabled={watermarking} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {watermarking ? '⏳ Adding Watermark...' : '💧 Add Watermark'}
          </button>
        </>
      )}
    </div>
  );
};

export default PdfWatermarkTool;