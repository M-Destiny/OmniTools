import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ fontSize: '1.35rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ 
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent' 
        }}>OmniTools</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Tools</a>
        <a href="#" style={{ color: 'var(--color-highlight)', textDecoration: 'none', fontWeight: 600 }}>Pro</a>
      </div>
    </nav>
  );
};

export default Navbar;
