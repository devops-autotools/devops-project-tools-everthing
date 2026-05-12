import React, { useState, useMemo, useRef } from 'react';
import { formatYAML } from '../utils/yaml-formatter';
import { FileCode2, Copy, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import '../index.css';

const YamlFormatter = () => {
  const [input, setInput] = useState('');
  const outputRef = useRef(null);

  const result = useMemo(() => {
    return formatYAML(input);
  }, [input]);

  const handleCopy = () => {
    if (!result.isValid || !result.formatted) return;
    navigator.clipboard.writeText(result.formatted);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!result.isValid || !result.formatted) return;
    const blob = new Blob([result.formatted], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="yaml-formatter-page">
      <header className="page-header">
        <h1>
          <FileCode2 size={28} style={{ color: 'var(--accent)' }} />
          YAML Formatter & Linter
        </h1>
        <p>Format messy YAML or convert JSON into clean YAML. Invalid syntax will be caught and highlighted.</p>
      </header>

      <main className="app-main two-columns">
        {/* Left Column: Input */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>Raw YAML or JSON</h2>
              {input.length > 0 && (
                <button className="btn btn-small" onClick={() => setInput('')}>Clear</button>
              )}
            </div>
          </div>
          
          <textarea 
            className="code-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="# Paste your raw YAML or JSON here..."
            spellCheck="false"
            style={{ flex: 1 }}
          />
        </section>

        {/* Right Column: Output / Error */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Formatted Output
                {input && result.isValid && (
                  <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                    <CheckCircle2 size={14} /> Valid YAML
                  </span>
                )}
                {input && !result.isValid && (
                  <span className="badge badge-error" style={{ marginLeft: '8px' }}>
                    <AlertTriangle size={14} /> Syntax Error
                  </span>
                )}
                {input && result.isValid && result.k8sErrors && result.k8sErrors.length > 0 && (
                  <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                    <AlertTriangle size={14} /> K8s Schema Error
                  </span>
                )}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-small" onClick={handleCopy} disabled={!result.isValid || !result.formatted}>
                  <Copy size={14} /> Copy
                </button>
                <button className="btn btn-small btn-primary" onClick={handleDownload} disabled={!result.isValid || !result.formatted}>
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
          
          {input && result.isValid && result.k8sErrors && result.k8sErrors.length > 0 && (
            <div className="k8s-warning-container">
              <div className="k8s-warning-header">
                <AlertTriangle size={20} className="warning-icon" />
                <h4>Kubernetes Schema Warning</h4>
              </div>
              <ul className="k8s-warning-list">
                {result.k8sErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {input && !result.isValid ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div className="error-container" style={{ flex: result.autoFixed ? 'none' : 1, height: 'auto', marginTop: 0 }}>
                <div className="error-header">
                  <AlertTriangle size={24} className="error-icon" />
                  <h3>Parsing Failed</h3>
                </div>
                <div className="error-details">
                  <p><strong>Error:</strong> {result.error.message}</p>
                  <p><strong>Line:</strong> {result.error.line}</p>
                </div>
                <div className="error-raw">
                  <pre>{result.error.fullError}</pre>
                </div>
              </div>
              
              {result.autoFixed && (
                <div className="autofix-container">
                  <div className="autofix-header">
                    <h3 style={{ margin: 0, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      💡 Auto-fix Suggestion
                    </h3>
                    <button className="btn btn-small btn-primary" onClick={() => setInput(result.autoFixed)}>
                      Apply Fix
                    </button>
                  </div>
                  <textarea 
                    className="code-editor"
                    value={result.autoFixed}
                    readOnly
                    spellCheck="false"
                    style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', opacity: 0.8 }}
                  />
                </div>
              )}
            </div>
          ) : (
            <textarea 
              ref={outputRef}
              className="code-editor"
              value={result.formatted}
              readOnly
              placeholder="# Formatted clean YAML will appear here..."
              spellCheck="false"
              style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)' }}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default YamlFormatter;
