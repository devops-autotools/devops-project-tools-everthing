import { useState, useEffect, useMemo, useRef } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import { extractImages, processImages, getConvertedYaml, generateMigrationScript } from './utils/parser';

function App() {
  const [yamlText, setYamlText] = useState('');
  const [privateRegistry, setPrivateRegistry] = useState(() => localStorage.getItem('privateRegistry') || '');
  const [extractedImages, setExtractedImages] = useState([]);

  // Search refs and states
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm3, setSearchTerm3] = useState('');

  useEffect(() => {
    localStorage.setItem('privateRegistry', privateRegistry);
  }, [privateRegistry]);

  useEffect(() => {
    const images = extractImages(yamlText);
    setExtractedImages(images);
  }, [yamlText]);

  const processedImages = useMemo(() => {
    return processImages(extractedImages, privateRegistry);
  }, [extractedImages, privateRegistry]);

  const convertedYaml = useMemo(() => {
    return getConvertedYaml(yamlText, processedImages);
  }, [yamlText, processedImages]);

  const migrationScript = useMemo(() => {
    return generateMigrationScript(processedImages);
  }, [processedImages]);

  const handleCopy = () => {
    if (!convertedYaml) return;
    navigator.clipboard.writeText(convertedYaml);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!convertedYaml) return;
    const blob = new Blob([convertedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'values-private.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScriptCopy = () => {
    if (!migrationScript) return;
    navigator.clipboard.writeText(migrationScript);
    alert('Script copied to clipboard!');
  };

  const handleSearch = (ref, term) => {
    if (!ref.current || !term) return;
    const text = ref.current.value;
    const startIndex = ref.current.selectionEnd || 0;
    
    // Find next occurrence
    let index = text.toLowerCase().indexOf(term.toLowerCase(), startIndex);
    if (index === -1 || index === startIndex - term.length) {
      // wrap around to beginning
      index = text.toLowerCase().indexOf(term.toLowerCase(), 0);
    }
    
    if (index !== -1) {
      ref.current.focus();
      ref.current.setSelectionRange(index, index + term.length);
      
      // Calculate scroll position to keep it in view
      const textBefore = text.substring(0, index);
      const lineCount = (textBefore.match(/\n/g) || []).length;
      // Rough estimation for line height
      const lineHeight = parseInt(getComputedStyle(ref.current).lineHeight) || 22;
      ref.current.scrollTop = (lineCount * lineHeight) - 50; // offset a bit
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Helm Image Converter
        </h1>
      </header>

      <main className="app-main">
        {/* Column 1: Input */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Original Values
              </h2>
            </div>
            <div className="search-bar">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Find keyword..." 
                value={searchTerm1}
                onChange={e => setSearchTerm1(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(inputRef, searchTerm1)}
              />
              <button className="btn btn-small" onClick={() => handleSearch(inputRef, searchTerm1)}>Find</button>
            </div>
          </div>
          <textarea 
            ref={inputRef}
            className="code-editor"
            value={yamlText}
            onChange={(e) => setYamlText(e.target.value)}
            placeholder="# Paste your values.yaml here..."
            spellCheck="false"
          />
        </section>

        {/* Column 2: Processing */}
        <section className="column">
          <div className="column-header" style={{ justifyContent: 'center' }}>
            <div className="column-header-row">
              <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Configuration & Images
              </h2>
              <span style={{ fontSize: '0.75rem', background: 'var(--accent)', padding: '2px 8px', borderRadius: '10px' }}>
                {extractedImages.length} found
              </span>
            </div>
          </div>
          
          <div className="column-content">
            <div className="config-section">
              <div className="input-group">
                <label>Private Registry URL</label>
                <input 
                  type="text" 
                  value={privateRegistry}
                  onChange={(e) => setPrivateRegistry(e.target.value)}
                  placeholder="e.g. harbor.mycompany.com"
                />
              </div>
            </div>

            <div className="images-list">
              {processedImages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
                  No images detected yet.<br/>Paste YAML on the left.
                </div>
              )}
              {processedImages.map((img, i) => (
                <div className="image-card" key={i}>
                  <div className="card-header">
                    <span>Line {img.repoLine !== undefined ? img.repoLine + 1 : img.line + 1}</span>
                    {img.type === 'registry' ? (
                      <span style={{color: 'var(--warning)', fontSize: '0.7rem', border: '1px solid var(--warning)', padding: '2px 4px', borderRadius: '4px'}}>REGISTRY ONLY</span>
                    ) : (
                      img.tag && <span style={{color: 'var(--accent)'}}>{img.tag}</span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="image-original">{img.repo}</div>
                    <div className="image-arrow">↓</div>
                    <div className="image-new">{img.newRepo}</div>
                  </div>
                </div>
              ))}
            </div>

            {migrationScript && (
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.875rem', color: 'var(--warning)' }}>Migration Script</h3>
                  <button className="btn btn-small" onClick={handleScriptCopy}>Copy Script</button>
                </div>
                <div className="migration-script">
                  {migrationScript}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Output */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Converted Values
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-small" onClick={handleCopy} disabled={!convertedYaml}>Copy</button>
                <button className="btn btn-small btn-primary" onClick={handleDownload} disabled={!convertedYaml}>Download</button>
              </div>
            </div>
            <div className="search-bar">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Find keyword..." 
                value={searchTerm3}
                onChange={e => setSearchTerm3(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(outputRef, searchTerm3)}
              />
              <button className="btn btn-small" onClick={() => handleSearch(outputRef, searchTerm3)}>Find</button>
            </div>
          </div>
          <textarea 
            ref={outputRef}
            className="code-editor"
            value={convertedYaml}
            readOnly
            placeholder="# Output will appear here..."
            spellCheck="false"
          />
        </section>
      </main>
      <SpeedInsights />
    </div>
  );
}

export default App;
