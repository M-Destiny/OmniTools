import React, { useState } from 'react';

const formatAndDeduplicateJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const seen = new Set();
    const deduplicated = JSON.stringify(
      parsed,
      (key, value) => {
        if (Array.isArray(value)) {
          return value.filter((item) => {
            const serialized = JSON.stringify(item);
            return seen.has(serialized) ? false : seen.add(serialized);
          });
        }
        return value;
      },
      2 // Formatting spacing
    );
    return deduplicated;
  } catch (error) {
    throw new Error('Invalid JSON syntax');
  }
};

const JSONOptimizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleOptimize = () => {
    try {
      const result = formatAndDeduplicateJSON(input);
      setOutput(result);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setOutput('');
    }
  };

  return (
    <div style={{ color: '#f1f5f9', padding: '1rem' }}>
      <h2>JSON Optimizer</h2>
      <textarea
        placeholder="Paste your JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', height: '150px', marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px' }}
      />
      <button 
        onClick={handleOptimize} 
        style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Optimize
      </button>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {output && (
        <textarea
          readOnly
          value={output}
          style={{ width: '100%', height: '150px', marginTop: '1rem', padding: '0.5rem', borderRadius: '8px' }}
        />
      )}
    </div>
  );
};

export default JSONOptimizer;
