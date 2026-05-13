import React, { useState, useCallback } from 'react';
import { ArrowLeftRight, Copy, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import yaml from 'js-yaml';

const JsonYamlConverter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState('json-to-yaml'); // 'json-to-yaml' | 'yaml-to-json'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = useCallback((text, dir) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      if (dir === 'json-to-yaml') {
        const parsed = JSON.parse(text);
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false }));
      } else {
        const parsed = yaml.load(text);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    convert(val, direction);
  };

  const handleSwap = () => {
    const newDir = direction === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml';
    setDirection(newDir);
    setInput(output);
    convert(output, newDir);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const inputLabel = direction === 'json-to-yaml' ? 'JSON Input' : 'YAML Input';
  const outputLabel = direction === 'json-to-yaml' ? 'YAML Output' : 'JSON Output';
  const inputPlaceholder = direction === 'json-to-yaml'
    ? '{\n  "apiVersion": "v1",\n  "kind": "Pod"\n}'
    : 'apiVersion: v1\nkind: Pod';
  const outputPlaceholder = direction === 'json-to-yaml'
    ? '# YAML will appear here...'
    : '# JSON will appear here...';

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
          <RefreshCw size={28} />
        </div>
        <div>
          <h1>JSON ↔ YAML Converter</h1>
          <p>Instantly convert between JSON and YAML formats. Real-time, client-side.</p>
        </div>
      </div>

      <div className="base64-mode-bar" style={{ flexShrink: 0 }}>
        <div className="base64-mode-tabs">
          <button
            className={`mode-tab ${direction === 'json-to-yaml' ? 'active' : ''}`}
            onClick={() => { setDirection('json-to-yaml'); convert(input, 'json-to-yaml'); }}
          >
            JSON → YAML
          </button>
          <button
            className={`mode-tab ${direction === 'yaml-to-json' ? 'active' : ''}`}
            onClick={() => { setDirection('yaml-to-json'); convert(input, 'yaml-to-json'); }}
          >
            YAML → JSON
          </button>
        </div>
      </div>

      <main className="app-main" style={{ gridTemplateColumns: '1fr auto 1fr', padding: 0 }}>
        {/* Input */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{inputLabel}</h2>
              <button className="btn btn-small btn-danger" onClick={handleClear} disabled={!input}>
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={input}
            onChange={handleInputChange}
            placeholder={inputPlaceholder}
            spellCheck="false"
            style={{ flex: 1 }}
          />
        </section>

        {/* Swap */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <button className="btn btn-icon" onClick={handleSwap} title="Swap direction">
            <ArrowLeftRight size={20} />
          </button>
        </div>

        {/* Output */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {outputLabel}
                {output && !error && (
                  <span className="badge badge-success" style={{ marginLeft: 8 }}>
                    <CheckCircle2 size={13} /> Done
                  </span>
                )}
                {error && (
                  <span className="badge badge-error" style={{ marginLeft: 8 }}>
                    <AlertTriangle size={13} /> Error
                  </span>
                )}
              </h2>
              <button className="btn btn-small btn-primary" onClick={handleCopy} disabled={!output || !!error}>
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          {error ? (
            <div className="error-container" style={{ marginTop: 0, flex: 1 }}>
              <div className="error-header">
                <AlertTriangle size={20} />
                <h3>Parse Error</h3>
              </div>
              <div className="error-details"><p>{error}</p></div>
            </div>
          ) : (
            <textarea
              className="code-editor"
              value={output}
              readOnly
              placeholder={outputPlaceholder}
              spellCheck="false"
              style={{ opacity: output ? 1 : 0.5, flex: 1 }}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default JsonYamlConverter;
