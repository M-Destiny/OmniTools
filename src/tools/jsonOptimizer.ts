import React, { useState } from 'react';

const formatJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input); // Parse JSON
    return JSON.stringify(parsed, null, 2); // Format JSON
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
      setError('');
      const result = formatJSON(input);
      setOutput(result);
    } catch (err: any) {
      setError(err.message);
      setOutput('');
    }
  };

  return (
    <div style={{ padding: '16px', color: 'white' }}>
      <h2>JSON Optimizer</h2>
      <textarea
        placeholder="Paste JSON here..."
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', borderRadius: '4px', padding: '8px' }}
      ></textarea>
      <button
        onClick={handleOptimize}
        style={{ backgroundColor: '#3B82F6', color: '#ffffff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Format JSON
      </button>
      {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
      {output && (
        <textarea
          readOnly
          rows={10}
          value={output}
          style={{ width: '100%', borderRadius: '4px', padding: '8px', marginTop: '8px' }}
        ></textarea>
      )}
    </div>
  );
};

export default JSONOptimizer;
