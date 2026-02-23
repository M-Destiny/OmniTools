import React from 'react';
import { useParams } from 'react-router-dom';
import { tools } from '../tools/registry';
import Navbar from '../components/Navbar';

// Import all tools
import JSONOptimizer from '../tools/jsonOptimizer';
import TextConverter from '../tools/textConverter';
import WordCounter from '../tools/wordCounter';
import ImageCompressTool from '../tools/ImageCompressTool';
import PdfMergeTool from '../tools/PdfMergeTool';
import PdfCompressTool from '../tools/PdfCompressTool';
import PdfToWordTool from '../tools/PdfToWordTool';
import WordToPdfTool from '../tools/WordToPdfTool';
import PdfToExcelTool from '../tools/PdfToExcelTool';
import ExcelToPdfTool from '../tools/ExcelToPdfTool';
import PdfToPowerPointTool from '../tools/PdfToPowerPointTool';
import PowerPointToPdfTool from '../tools/PowerPointToPdfTool';
import PdfToJpgTool from '../tools/PdfToJpgTool';
import JpgToPdfTool from '../tools/JpgToPdfTool';
import PdfSignTool from '../tools/PdfSignTool';
import PdfWatermarkTool from '../tools/PdfWatermarkTool';
import PhotosToPdfTool from '../tools/PhotosToPdfTool';
import PdfEditorTool from '../tools/PdfEditorTool';

const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tool = tools.find((tool) => tool.id === id);

  if (!tool) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)', textAlign: 'center', margin: '2rem' }}>
        <h1>Tool Not Found</h1>
        <p>We couldn't find the tool you were looking for.</p>
      </div>
    );
  }

  const renderTool = () => {
    switch (tool.id) {
      case 'json-optimizer':
        return <JSONOptimizer />;
      case 'text-converter':
        return <TextConverter />;
      case 'word-counter':
        return <WordCounter />;
      case 'image-compress':
        return <ImageCompressTool />;
      case 'pdf-merge':
        return <PdfMergeTool />;
      case 'pdf-compress':
        return <PdfCompressTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'pdf-to-excel':
        return <PdfToExcelTool />;
      case 'excel-to-pdf':
        return <ExcelToPdfTool />;
      case 'pdf-to-powerpoint':
        return <PdfToPowerPointTool />;
      case 'powerpoint-to-pdf':
        return <PowerPointToPdfTool />;
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'pdf-sign':
        return <PdfSignTool />;
      case 'pdf-editor':
        return <PdfEditorTool />;
      case 'pdf-watermark':
        return <PdfWatermarkTool />;
      case 'photos-to-pdf':
        return <PhotosToPdfTool />;
      default:
        return <p style={{ color: 'var(--text-secondary)' }}>Tool functionality is coming soon. Stay tuned!</p>;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            {tool.icon} {tool.name}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{tool.description}</p>
        </header>
        <section>
          {renderTool()}
        </section>
      </main>
    </div>
  );
};

export default ToolDetail;
