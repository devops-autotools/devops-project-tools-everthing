import React, { useState } from 'react';
import { Layers, Search, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const SECURITY_HEADERS = [
  { name: 'Strict-Transport-Security', short: 'HSTS', desc: 'Forces HTTPS connections' },
  { name: 'Content-Security-Policy', short: 'CSP', desc: 'Controls allowed content sources' },
  { name: 'X-Frame-Options', short: 'X-Frame', desc: 'Prevents clickjacking via iframes' },
  { name: 'X-Content-Type-Options', short: 'XCTO', desc: 'Prevents MIME sniffing' },
  { name: 'Referrer-Policy', short: 'Referrer', desc: 'Controls referrer information' },
  { name: 'Permissions-Policy', short: 'Permissions', desc: 'Controls browser feature access' },
  { name: 'X-XSS-Protection', short: 'XSS', desc: 'Legacy XSS filter (deprecated)' },
];

const HttpHeaders = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inspect = async () => {
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    setLoading(true); setError(''); setResult(null);
    try {
      // corsproxy.io forwards requests and preserves response headers via a special header
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(target)}`;
      const res = await fetch(proxyUrl);

      const statusCode = res.status;

      // Parse all response headers
      const headers = {};
      res.headers.forEach((value, key) => {
        // Skip proxy-injected headers
        if (!['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'].includes(key)) {
          headers[key] = value;
        }
      });

      // Security score
      const secScore = SECURITY_HEADERS.filter(h => headers[h.name.toLowerCase()]).length;
      setResult({ url: target, statusCode, headers, secScore, totalHeaders: Object.keys(headers).length });
    } catch (e) {
      setError(e.message.includes('fetch') ? 'Network error — the site may be blocking proxy requests or is unreachable.' : e.message);
    } finally { setLoading(false); }
  };

  const getScoreColor = (score) => score >= 5 ? '#10b981' : score >= 3 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (score) => score >= 5 ? 'Good' : score >= 3 ? 'Fair' : 'Poor';

  const getStatusColor = (code) => code >= 500 ? '#ef4444' : code >= 400 ? '#f97316' : code >= 300 ? '#f59e0b' : '#10b981';

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
          <Layers size={28} />
        </div>
        <div>
          <h1>HTTP Headers Inspector</h1>
          <p>Inspect HTTP response headers and get a security score for any URL.</p>
        </div>
      </div>

      <div className="domain-search-bar">
        <input className="domain-input" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && inspect()} placeholder="https://example.com" spellCheck="false" />
        <button className="btn btn-primary" onClick={inspect} disabled={loading || !url.trim()}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {loading ? 'Fetching...' : 'Inspect'}
        </button>
      </div>

      <div className="domain-note">
        <AlertTriangle size={13} />
        <span>Uses a CORS proxy (allorigins.win). Some sites may block proxy requests.</span>
      </div>

      {error && <div className="domain-error-box"><AlertTriangle size={18} /><span><strong>Error:</strong> {error}</span></div>}

      {result && (
        <div className="headers-layout">
          {/* Left: Security Score + Security Headers */}
          <div className="headers-left">
            <div className="security-score-card">
              <div className="security-score-circle" style={{ borderColor: getScoreColor(result.secScore) }}>
                <span style={{ color: getScoreColor(result.secScore), fontSize: '2rem', fontWeight: 700 }}>{result.secScore}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/ {SECURITY_HEADERS.length}</span>
              </div>
              <div>
                <div className="security-grade" style={{ color: getScoreColor(result.secScore) }}>Security: {getScoreLabel(result.secScore)}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  HTTP <span style={{ color: getStatusColor(result.statusCode), fontWeight: 600 }}>{result.statusCode}</span>
                  {' · '}{result.totalHeaders} headers
                </div>
              </div>
            </div>

            <div className="security-headers-list">
              <div className="ssl-card-header">Security Headers Audit</div>
              {SECURITY_HEADERS.map(h => {
                const found = result.headers[h.name.toLowerCase()];
                return (
                  <div key={h.name} className={`sec-header-row ${found ? 'sec-header-found' : 'sec-header-missing'}`}>
                    <div className="sec-header-icon">
                      {found ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                    </div>
                    <div>
                      <div className="sec-header-name">{h.short}</div>
                      <div className="sec-header-desc">{h.desc}</div>
                      {found && <div className="sec-header-value">{found.slice(0, 60)}{found.length > 60 ? '...' : ''}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: All Headers */}
          <div className="headers-right">
            <div className="ssl-card-header">All Response Headers ({result.totalHeaders})</div>
            <div className="all-headers-list">
              {Object.entries(result.headers).map(([k, v]) => (
                <div key={k} className="header-row">
                  <span className="header-key">{k}</span>
                  <span className="header-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HttpHeaders;
