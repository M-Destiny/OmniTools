import React, { useCallback, useMemo, useState } from 'react';

type Mode = 'format' | 'minify';

const parseJSON = (input: string) => JSON.parse(input);

const stringifyJSON = (data: unknown, mode: Mode): string =>
  mode === 'format' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

const JSONOptimizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>('format');

  const isValidJSON = useMemo(() => {
    if (!input.trim()) {
      return false;
    }
    try {
      parseJSON(input);
      return true;
    } catch {
      return false;
    }
  }, [input]);

  const handleProcess = useCallback(() => {
    try {
      const parsed = parseJSON(input);
      const result = stringifyJSON(parsed, mode);
      setOutput(result);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON syntax');
      setOutput('');
    }
  }, [input, mode]);

  const handleCopy = useCallback(() => {
    if (!output) {
      return;
    }
    navigator.clipboard.writeText(output);
  }, [output]);

  return (
    <div style={containerStyle}>
      <h2>JSON Optimizer</h2>
      <textarea
        placeholder="Paste your JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={textareaStyle}
      />
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={() => setMode('format')}
          style={mode === 'format' ? activeButton : buttonStyle}
        >
          Format
        </button>
        <button
          onClick={() => setMode('minify')}
          style={mode === 'minify' ? activeButton : buttonStyle}
        >
          Minify
        </button>
        <button
          onClick={handleProcess}
          disabled={!isValidJSON}
          style={{ ...buttonStyle, opacity: isValidJSON ? 1 : 0.6 }}
        >
          Apply
        </button>
        <button onClick={handleCopy} disabled={!output} style={buttonStyle}>
          Copy
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {output && <textarea readOnly value={output} style={textareaStyle} />}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  color: 'white',
  padding: '1rem',
  maxWidth: '800px',
  margin: '0 auto',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '180px',
  marginBottom: '8px',
  padding: '8px',
  borderRadius: '4px',
  fontFamily: 'monospace',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#3B82F6',
  color: '#fff',
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginRight: '6px',
};

const activeButton: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#1D4ED8',
};

export default JSONOptimizer;
