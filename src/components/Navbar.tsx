import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      color: '#f1f5f9',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>OmniTools</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
        <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
        <a href="#" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Pro</a>
      </div>
    </nav>
  );
};

export default Navbar;
