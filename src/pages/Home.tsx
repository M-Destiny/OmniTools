import React, { useState } from 'react';
import { tools } from '../tools/registry';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <Navbar />
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Small Tools, Big Impact</h1>
          <p style={{ color: '#94a3b8' }}>Simple, fast, and secure tools for your daily tasks.</p>
        </header>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search tools..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: 'white',
              flex: '1',
              minWidth: '250px'
            }}
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: 'white'
            }}
          >
            <option value="all">All Categories</option>
            <option value="json">JSON</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="ai">AI</option>
          </select>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredTools.map(tool => (
            <div key={tool.id} style={{
              backgroundColor: '#1e293b',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #334155',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{tool.icon}</div>
              <h3 style={{ marginBottom: '0.5rem' }}>{tool.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{tool.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
