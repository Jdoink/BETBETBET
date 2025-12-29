'use client';

import { useState } from 'react';
import { saveOperatorConfig, clearOperatorConfig } from '@/lib/dailyConfig';

interface OperatorPanelProps {
  onConfigUpdate: () => void;
}

export default function OperatorPanel({ onConfigUpdate }: OperatorPanelProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = () => {
    try {
      const config = JSON.parse(jsonInput);
      saveOperatorConfig(config);
      setMessage('Config saved to localStorage!');
      setTimeout(() => {
        onConfigUpdate();
      }, 500);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleClear = () => {
    clearOperatorConfig();
    setJsonInput('');
    setMessage('Config cleared from localStorage!');
    setTimeout(() => {
      onConfigUpdate();
    }, 500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-yellow-500 p-4 max-h-[50vh] overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-yellow-500 mb-3">
          Operator Mode
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          Paste your daily market JSON here to override the default config for testing.
        </p>
        <textarea
          className="w-full h-32 bg-gray-800 text-white p-3 rounded border border-gray-700 font-mono text-sm"
          placeholder='{"title": "Game Title", "teamA": "Team A", ...}'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        <div className="flex gap-3 mt-3">
          <button onClick={handleSave} className="btn-primary">
            Save Config
          </button>
          <button onClick={handleClear} className="btn-secondary">
            Clear Config
          </button>
        </div>
        {message && (
          <p className="mt-3 text-sm text-green-400">{message}</p>
        )}
      </div>
    </div>
  );
}
