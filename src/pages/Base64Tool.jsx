import React, { useState, useCallback } from 'react';
import { ShieldCheck, Copy, Trash2, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';

const detectBase64 = (str) => {
  if (!str || str.length < 4) return false;
  const b64Regex = /^[A-Za-z0-9+/=]+$/;
  const urlB64Regex = /^[A-Za-z0-9_-]+=*$/;
  return b64Regex.test(str.trim()) || urlB64Regex.test(str.trim());
};

const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = useCallback((text, currentMode, isUrlSafe) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setError('');
      if (currentMode === 'encode') {
        let encoded = btoa(unescape(encodeURIComponent(text)));
        if (isUrlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        setOutput(encoded);
      } else {
        let normalized = text.trim();
        if (isUrlSafe) {
          normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
          while (normalized.length % 4 !== 0) normalized += '=';
        }
        const decoded = decodeURIComponent(escape(atob(normalized)));
        setOutput(decoded);
      }
    } catch (e) {
      setError('Invalid Base64 string. Please check your input.');
      setOutput('');
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    process(val, mode, urlSafe);
  };

  const handleModeToggle = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    process(output, newMode, urlSafe);
  };

  const handleUrlSafeToggle = (e) => {
    setUrlSafe(e.target.checked);
    process(input, mode, e.target.checked);
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

  const autoDetected = input && detectBase64(input) && mode === 'encode'
    ? 'Looks like Base64 — switch to Decode?'
    : '';

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1>Base64 Encode / Decode</h1>
          <p>Encode text to Base64 or decode Base64 back to plain text. 100% offline.</p>
        </div>
      </div>

      <div className="base64-mode-bar" style={{ flexShrink: 0 }}>
        <div className="base64-mode-tabs">
          <button
            className={`mode-tab ${mode === 'encode' ? 'active' : ''}`}
            onClick={() => { setMode('encode'); process(input, 'encode', urlSafe); }}
          >
            Encode → Base64
          </button>
          <button
            className={`mode-tab ${mode === 'decode' ? 'active' : ''}`}
            onClick={() => { setMode('decode'); process(input, 'decode', urlSafe); }}
          >
            Base64 → Decode
          </button>
        </div>
        <label className="toggle-label">
          <input type="checkbox" checked={urlSafe} onChange={handleUrlSafeToggle} />
          <span>URL-safe Base64</span>
        </label>
      </div>

      {autoDetected && (
        <div className="autodetect-hint" style={{ flexShrink: 0, marginBottom: 16 }}>
          <AlertTriangle size={14} />
          <span>{autoDetected}</span>
          <button className="btn btn-small" onClick={handleModeToggle}>Switch to Decode</button>
        </div>
      )}

      <main className="app-main" style={{ gridTemplateColumns: '1fr auto 1fr', padding: 0 }}>
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</h2>
              <button className="btn btn-small btn-danger" onClick={handleClear} disabled={!input}>
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'encode' ? 'Enter any text to encode...' : 'Paste Base64 string here...'}
            spellCheck="false"
            style={{ flex: 1 }}
          />
        </section>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          <button className="btn btn-icon" onClick={handleModeToggle} title="Swap input/output">
            <ArrowLeftRight size={20} />
          </button>
        </div>

        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                {output && !error && (
                  <span className="badge badge-success" style={{ marginLeft: 8 }}>
                    <CheckCircle2 size={13} /> Ready
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
                <h3>Error</h3>
              </div>
              <div className="error-details"><p>{error}</p></div>
            </div>
          ) : (
            <textarea
              className="code-editor"
              value={output}
              readOnly
              placeholder={mode === 'encode' ? '# Encoded Base64 will appear here...' : '# Decoded text will appear here...'}
              spellCheck="false"
              style={{ opacity: output ? 1 : 0.5, flex: 1 }}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default Base64Tool;
