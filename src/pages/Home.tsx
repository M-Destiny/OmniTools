import React, { useState } from 'react';
import { tools } from '../tools/registry';
import Navbar from '../components/Navbar';
import '../App.css';

const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="home-container" style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9' }}>
      <Navbar />
      <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1rem' }}>
            Small Tools, Big Impact
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', maxWidth: '600px', margin: '0 auto' }}>
            Simple, fast, and secure tools for your daily tasks.
          </p>
        </header>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          <input 
            type="text" 
            placeholder="Search tools..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Categories</option>
            <option value="json">JSON</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="ai">AI</option>
          </select>
        </div>

        <div className="tool-grid">
          {filteredTools.map(tool => (
            <div key={tool.id} className="tool-card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{tool.icon}</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{tool.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{tool.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
