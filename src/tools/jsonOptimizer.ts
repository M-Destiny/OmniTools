import React, { useState } from 'react';

const formatAndDeduplicateJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const seen = new Set();

    function dedupe(value: any): any {
      if (Array.isArray(value)) {
        return value.filter((item) => {
          const serialized = JSON.stringify(item);
          if (!seen.has(serialized)) {
            seen.add(serialized);
            return true;
          }
          return false;
        });
      }
      return value;
    }

    const deduplicated = JSON.stringify(parsed, (key, value) => dedupe(value), 2);

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
      setError('');
      const result = formatAndDeduplicateJSON(input);
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
        Optimize JSON
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
