import React, { useState } from 'react';

const convertTextCase = (input: string, mode: 'uppercase' | 'lowercase'): string => {
  return mode === 'uppercase' ? input.toUpperCase() : input.toLowerCase();
};

const TextConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleConversion = (mode: 'uppercase' | 'lowercase') => {
    const result = convertTextCase(input, mode);
    setOutput(result);
  };

  return (
    <div style={{ padding: '16px', color: 'white' }}>
      <h2>Text Converter</h2>
      <textarea
        placeholder="Enter text here"
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', borderRadius: '4px', padding: '8px' }}
      ></textarea>
      <div>
        <button
          onClick={() => handleConversion('uppercase')}
          style={{ backgroundColor: '#10B981', color: '#ffffff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
        >
          Convert to UPPERCASE
        </button>
        <button
          onClick={() => handleConversion('lowercase')}
          style={{ backgroundColor: '#EF4444', color: '#ffffff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Convert to lowercase
        </button>
      </div>
      {output && (
        <textarea
          readOnly
          rows={5}
          value={output}
          style={{ width: '100%', borderRadius: '4px', padding: '8px', marginTop: '8px' }}
        ></textarea>
      )}
    </div>
  );
};

export default TextConverter;
