import React, { useState } from 'react';

const formatAndDeduplicateJSON = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const seen = new Set();
    const deduplicated = JSON.stringify(
      parsed,
      (key, value) => {
        if (Array.isArray(value)) {
          return value.filter((item: any) => {
            const serialized = JSON.stringify(item);
            if (!seen.has(serialized)) {
              seen.add(serialized);
              return true;
            }
            return false;
          });
        }
        return value;
      },
      2 // Pretty print JSON
    );
    return deduplicated;
  } catch (error) {
    return 'Invalid JSON syntax';
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
    } catch (err: any) {
      setError('Could not process JSON. Please check your input.');
      setOutput('');
    }
  };

  return (
    <div style={{ padding: '16px', color: 'white' }}>
      <h2>JSON Optimizer</h2>
      <textarea
        rows={10}
        placeholder="Paste JSON here..."
        value={input}
        onChange={(event) => setInput(event.target.value)}
        style={{ width: '100%', marginBottom: '16px', padding: '8px', borderRadius: '4px' }}
      />
      <button onClick={handleOptimize} style={{ backgroundColor: '#007BFF', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
        Optimize
      </button>
      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}
      {output && <textarea value={output} readOnly style={{ marginTop: '16px', width: '100%', padding: '8px', borderRadius: '4px' }} rows={10} />}
    </div>
  );
};

export default JSONOptimizer;
