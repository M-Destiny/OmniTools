import React from 'react';
import { useParams } from 'react-router-dom';
import { tools } from '../tools/registry';
import Navbar from '../components/Navbar';

const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tool = tools.find((tool) => tool.id === id);

  if (!tool) {
    return (
      <div style={{ color: 'white', textAlign: 'center', margin: '2rem' }}>
        <h1>Tool Not Found</h1>
        <p>We couldn't find the tool you were looking for.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <Navbar />
      <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>{tool.icon} {tool.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>{tool.description}</p>
        </header>
        <section>
          <p>Tool functionality is coming soon. Stay tuned!</p>
        </section>
      </main>
    </div>
  );
};

export default ToolDetail;
