import React, { useState } from 'react';

const formatJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
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
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  };

  return (
    <div style={{ color: 'white', padding: '1rem' }}>
      <h2>JSON Optimizer</h2>
      <textarea
        placeholder="Paste your JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: '100%',
          height: '150px',
          marginBottom: '8px',
          padding: '8px',
          borderRadius: '4px',
        }}
      ></textarea>
      <button
        onClick={handleOptimize}
        style={{
          backgroundColor: '#3B82F6',
          color: '#fff',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Optimize
      </button>
      {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
      {output && (
        <textarea
          readOnly
          value={output}
          style={{
            width: '100%',
            height: '150px',
            marginTop: '8px',
            padding: '8px',
            borderRadius: '4px',
          }}
        ></textarea>
      )}
    </div>
  );
};

export default JSONOptimizer;
