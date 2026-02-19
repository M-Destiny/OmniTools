import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      color: '#f1f5f9'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>OmniTools</div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
        <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</a>
      </div>
    </nav>
  );
};

export default Navbar;
