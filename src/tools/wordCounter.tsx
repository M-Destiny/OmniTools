import React, { useState } from 'react';

const countWords = (text: string): number => {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
};

const WordCounter: React.FC = () => {
  const [input, setInput] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleCountWords = () => {
    const count = countWords(input);
    setWordCount(count);
  };

  return (
    <div style={{ padding: '16px', color: 'white' }}>
      <h2>Word Counter</h2>
      <textarea
        placeholder="Enter text here"
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', borderRadius: '4px', padding: '8px' }}
      ></textarea>
      <button
        onClick={handleCountWords}
        style={{ backgroundColor: '#6366F1', color: '#ffffff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Count Words
      </button>
      <p style={{ marginTop: '16px', fontSize: '1rem' }}>Word Count: {wordCount}</p>
    </div>
  );
};

export default WordCounter;
