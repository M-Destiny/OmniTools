import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FilePreview from '../components/FilePreview';

const PdfToPowerPointTool: React.FC = () => {
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

  const convertToPowerPoint = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      // Create a simple PPTX structure
      const zip = new JSZip();
      
      // Add minimal PPTX structure
      zip.file('[Content_Types].xml', `?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
 <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
</Types>`);
      
      const relsFolder = zip.folder('_rels')!;
      relsFolder.file('.rels', `?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

      const pptFolder = zip.folder('ppt')!;
      pptFolder.file('presentation.xml', `?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
</p:presentation>`);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name.replace('.pdf', '')}_slides.pptx`);
      
    } catch (err) {
      setError('Error converting PDF: ' + (err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>PDF to PowerPoint</h2>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⚠️ Note: Creates a basic PPTX structure. Full conversion requires server-side processing.</p>
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
        <p>Drop PDF here or click to browse</p>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      {file && (
        <>
          <FilePreview files={[file]} onRemove={() => setFile(null)} />
          
          <div style={{ marginTop: '1rem' }}>
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

          <button onClick={convertToPowerPoint} disabled={converting} style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>
            {converting ? '⏳ Converting...' : '🎬 Convert to PPTX'}
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfToPowerPointTool;