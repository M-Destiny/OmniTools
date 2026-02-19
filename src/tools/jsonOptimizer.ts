import React, { useState } from 'react';

const formatAndValidateJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2); // Format and validate only
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
      const result = formatAndValidateJSON(input);
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
        placeholder="Enter your JSON here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', height: '150px', marginBottom: '1rem', padding: '0.5rem' }}
      ></textarea>
      <button
        onClick={handleOptimize}
        style={{ padding: '0.5rem', backgroundColor: '#007BFF', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '1rem' }}
      >
        Format JSON
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {output && (
        <textarea
          readOnly
          value={output}
          style={{ width: '100%', height: '150px', padding: '0.5rem' }}
        ></textarea>
      )}
    </div>
  );
};

export default JSONOptimizer;
