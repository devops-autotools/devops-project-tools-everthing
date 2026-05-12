import React, { useState, useMemo } from 'react';
import { decodeJWT } from '../utils/jwt';
import { KeySquare, ShieldAlert, ShieldCheck, Clock, Copy } from 'lucide-react';
import '../index.css';

const JwtDecoder = () => {
  const [token, setToken] = useState('');

  const decoded = useMemo(() => {
    return decodeJWT(token);
  }, [token]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="jwt-decoder-page">
      <header className="page-header">
        <h1>
          <KeySquare size={28} style={{ color: 'var(--accent)' }} />
          JWT Decoder
        </h1>
        <p>Decode JSON Web Tokens locally. Your token never leaves your browser.</p>
      </header>

      <main className="app-main two-columns">
        {/* Left Column: Encoded */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>Encoded Token</h2>
              {decoded && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {decoded.isExpired ? (
                    <span className="badge badge-error">
                      <ShieldAlert size={14} /> Expired
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      <ShieldCheck size={14} /> Valid Signature Required
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="column-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <textarea 
              className="code-editor jwt-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here (e.g., eyJhbGci...)"
              spellCheck="false"
            />
            
            {decoded && (
              <div className="jwt-visualizer">
                <div className="jwt-part jwt-header-text">{decoded.parts.header}</div>
                <div className="jwt-dot">.</div>
                <div className="jwt-part jwt-payload-text">{decoded.parts.payload}</div>
                <div className="jwt-dot">.</div>
                <div className="jwt-part jwt-signature-text">{decoded.parts.signature}</div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Decoded */}
        <section className="column">
          <div className="column-header">
            <div className="column-header-row">
              <h2>Decoded Content</h2>
              {decoded && decoded.expiresAt && (
                <span className={`badge ${decoded.isExpired ? 'badge-error' : 'badge-warning'}`} style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                  <Clock size={12} style={{ marginRight: '4px' }}/> 
                  {decoded.isExpired ? 'Expired on ' : 'Expires '} 
                  {decoded.expiresAt.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="column-content decoded-content">
            {!decoded ? (
              <div className="empty-state">
                <KeySquare size={48} className="empty-icon" />
                <p>Paste a valid JWT token on the left to see its decoded contents.</p>
              </div>
            ) : (
              <div className="json-blocks">
                <div className="json-block">
                  <div className="json-header">
                    <span className="jwt-header-label">HEADER: ALGORITHM & TOKEN TYPE</span>
                    <button className="btn-icon" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2))}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="json-pre jwt-header-box">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>

                <div className="json-block">
                  <div className="json-header">
                    <span className="jwt-payload-label">PAYLOAD: DATA</span>
                    <button className="btn-icon" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2))}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="json-pre jwt-payload-box">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>

                <div className="json-block">
                  <div className="json-header">
                    <span className="jwt-signature-label">VERIFY SIGNATURE</span>
                  </div>
                  <pre className="json-pre jwt-signature-box">
                    HMACSHA256(
                      base64UrlEncode(header) + "." +
                      base64UrlEncode(payload),
                      your-256-bit-secret
                    )
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default JwtDecoder;
