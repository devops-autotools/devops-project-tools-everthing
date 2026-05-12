import React, { useState, useRef, useMemo } from 'react';
import { mergeKubeconfigs } from '../utils/kubeconfig';
import { UploadCloud, File, Trash2, Copy, Download, GitMerge } from 'lucide-react';
import '../index.css';

const KubeconfigMerger = () => {
  const [files, setFiles] = useState([]); // { name: string, content: string }
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const outputRef = useRef(null);

  const mergedYaml = useMemo(() => {
    const contents = files.map(f => f.content);
    return mergeKubeconfigs(contents);
  }, [files]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (fileList) => {
    const newFiles = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const text = await readFileAsText(file);
      newFiles.push({ name: file.name, content: text, size: file.size });
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleCopy = () => {
    if (!mergedYaml) return;
    navigator.clipboard.writeText(mergedYaml);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!mergedYaml) return;
    const blob = new Blob([mergedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeconfig-merged.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="kubeconfig-merger-page">
      <header className="page-header">
        <h1>
          <GitMerge size={28} style={{ color: 'var(--accent)' }} />
          Kubeconfig Merger
        </h1>
        <p>Drop multiple kubeconfig files here to safely merge their clusters, contexts, and users into a single file.</p>
      </header>

      <main className="app-main two-columns">
        {/* Left Column: Drag & Drop */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>
                <UploadCloud size={18} />
                Input Files
              </h2>
              {files.length > 0 && (
                <button className="btn btn-small" onClick={clearAll}>Clear All</button>
              )}
            </div>
          </div>
          
          <div className="column-content" style={{ padding: '16px' }}>
            <div 
              className={`dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} className="dropzone-icon" />
              <h3>Drag & Drop kubeconfig files here</h3>
              <p>or click to browse from your computer</p>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>

            {files.length > 0 && (
              <div className="file-list">
                <h4 style={{ margin: '16px 0 8px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Uploaded Files ({files.length})
                </h4>
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <File size={16} className="file-icon" />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button className="btn-icon" onClick={() => removeFile(index)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Output */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>
                <File size={18} />
                Merged Kubeconfig
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-small" onClick={handleCopy} disabled={!mergedYaml}>
                  <Copy size={14} /> Copy
                </button>
                <button className="btn btn-small btn-primary" onClick={handleDownload} disabled={!mergedYaml}>
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
          
          <textarea 
            ref={outputRef}
            className="code-editor"
            value={mergedYaml}
            readOnly
            placeholder="# Merged output will appear here..."
            spellCheck="false"
          />
        </section>
      </main>
    </div>
  );
};

export default KubeconfigMerger;
