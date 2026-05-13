import React, { useState } from 'react';
import { Lock, Search, Loader2, AlertTriangle, CheckCircle2, Shield, Calendar, Globe, Link } from 'lucide-react';

const SslChecker = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    const d = domain.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!d) return;
    setLoading(true); setError(''); setResult(null);
    try {
      // Certspotter API supports CORS natively (unlike crt.sh)
      const res = await fetch(
        `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(d)}&include_subdomains=false&expand=dns_names&expand=cert`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) throw new Error(`Certspotter API error: HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('No certificates found for this domain.');

      // Sort by not_after descending to get the most recent cert
      const sorted = data
        .filter(c => c.not_after)
        .sort((a, b) => new Date(b.not_after) - new Date(a.not_after));

      const latest = sorted[0];
      const expiryDate = new Date(latest.not_after);
      const issuedDate = new Date(latest.not_before);
      const daysLeft = Math.ceil((expiryDate - Date.now()) / 86400000);

      const sanSet = new Set();
      sorted.slice(0, 5).forEach(c => {
        (c.dns_names || []).forEach(s => sanSet.add(s.toLowerCase()));
      });

      const issuerName = latest.cert?.issuer?.organization?.[0] || latest.issuer?.name || 'Unknown';

      setResult({
        domain: d,
        commonName: latest.dns_names?.[0] || d,
        issuer: issuerName,
        issuedDate,
        expiryDate,
        daysLeft,
        id: latest.id,
        sans: [...sanSet].sort(),
        totalCerts: data.length,
      });
    } catch (e) {
      setError(e.message.includes('fetch') ? 'Network error — check your internet connection.' : e.message);
    }
    finally { setLoading(false); }
  };

  const st = (days) => days < 0
    ? { label: 'Expired', color: '#ef4444' }
    : days <= 30 ? { label: `Expires in ${days}d`, color: '#f59e0b' }
    : { label: `Valid · ${days} days left`, color: '#10b981' };

  const fmtDate = (d) => d.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
  const issuerName = (s) => { const m = s.match(/O=([^,]+)/); return m ? m[1].trim() : s; };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <Lock size={28} />
        </div>
        <div>
          <h1>SSL Certificate Checker</h1>
          <p>Check SSL/TLS certificate expiry, issuer, and SANs for any domain.</p>
        </div>
      </div>

      <div className="domain-search-bar">
        <input className="domain-input" value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="example.com" spellCheck="false" />
        <button className="btn btn-primary" onClick={check} disabled={loading || !domain.trim()}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {loading ? 'Checking...' : 'Check SSL'}
        </button>
      </div>

      {error && <div className="domain-error-box"><AlertTriangle size={18} /><span><strong>Error:</strong> {error}</span></div>}

      {result && (() => {
        const status = st(result.daysLeft);
        return (
          <div className="ssl-results">
            <div className="ssl-status-banner" style={{ borderColor: status.color, background: `${status.color}11` }}>
              {result.daysLeft > 0 ? <CheckCircle2 size={28} style={{ color: status.color }} /> : <AlertTriangle size={28} style={{ color: status.color }} />}
              <div><div className="ssl-status-label" style={{ color: status.color }}>{status.label}</div><div className="ssl-status-domain">{result.domain}</div></div>
              <div className="ssl-days-circle" style={{ borderColor: status.color, color: status.color }}>
                <span className="ssl-days-number">{Math.abs(result.daysLeft)}</span>
                <span className="ssl-days-text">days</span>
              </div>
            </div>
            <div className="ssl-grid">
              <div className="ssl-card">
                <div className="ssl-card-header"><Shield size={16} /> Certificate Details</div>
                <div className="ssl-row"><span>Common Name</span><span>{result.commonName}</span></div>
                <div className="ssl-row"><span>Issuer</span><span>{issuerName(result.issuer)}</span></div>
                <div className="ssl-row"><span>crt.sh</span><a href={`https://crt.sh/?id=${result.id}`} target="_blank" rel="noreferrer" className="ssl-link"><Link size={12} /> #{result.id}</a></div>
              </div>
              <div className="ssl-card">
                <div className="ssl-card-header"><Calendar size={16} /> Validity Period</div>
                <div className="ssl-row"><span>Issued</span><span>{fmtDate(result.issuedDate)}</span></div>
                <div className="ssl-row"><span>Expires</span><span style={{ color: result.daysLeft < 30 ? '#f59e0b' : 'inherit' }}>{fmtDate(result.expiryDate)}</span></div>
                <div className="ssl-row"><span>Total Certs</span><span>{result.totalCerts} in logs</span></div>
              </div>
              {result.sans.length > 0 && (
                <div className="ssl-card ssl-card-full">
                  <div className="ssl-card-header"><Globe size={16} /> Subject Alternative Names ({result.sans.length})</div>
                  <div className="ssl-sans-grid">
                    {result.sans.slice(0, 30).map((san, i) => <span key={i} className="ssl-san-chip">{san}</span>)}
                    {result.sans.length > 30 && <span className="ssl-san-chip ssl-san-more">+{result.sans.length - 30} more</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SslChecker;
