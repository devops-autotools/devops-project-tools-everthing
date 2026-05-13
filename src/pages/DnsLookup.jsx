import React, { useState } from 'react';
import { Search, Globe, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'SRV', 'PTR', 'CAA'];

// Only CORS-safe DoH servers (Google JSON API doesn't need custom Accept header)
const DNS_SERVERS = [
  { label: 'Google (8.8.8.8)', url: 'https://dns.google/resolve' },
  { label: 'Cloudflare (1.1.1.1)', url: 'https://cloudflare-dns.com/dns-query' },
  { label: 'Google (Backup)', url: 'https://8.8.8.8/resolve' },
];

const TYPE_COLORS = {
  A: '#3b82f6', AAAA: '#8b5cf6', CNAME: '#10b981',
  MX: '#f59e0b', TXT: '#6366f1', NS: '#14b8a6',
  SOA: '#f97316', SRV: '#ec4899', PTR: '#84cc16', CAA: '#06b6d4'
};

const DnsLookup = () => {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [dnsServer, setDnsServer] = useState(DNS_SERVERS[0]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Use Google DNS JSON API - supports CORS natively, no custom headers needed
      const url = `${dnsServer.url}?name=${encodeURIComponent(domain.trim())}&type=${recordType}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.Status !== 0) {
        const statusMessages = { 1: 'Format Error', 2: 'Server Failure', 3: 'Non-Existent Domain (NXDOMAIN)', 5: 'Query Refused' };
        throw new Error(statusMessages[data.Status] || `DNS Error Code: ${data.Status}`);
      }

      setResults(data);
    } catch (e) {
      setError(e.message.includes('fetch') || e.message.includes('ERR_') 
        ? 'Network error — DNS over HTTPS requires internet access. Make sure you\'re online.' 
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') lookup(); };

  const formatRdata = (record) => {
    if (recordType === 'MX') return `Priority: ${record.data.split(' ')[0]}  →  ${record.data.split(' ')[1]}`;
    if (recordType === 'TXT') return record.data.replace(/"/g, '');
    return record.data;
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
          <Globe size={28} />
        </div>
        <div>
          <h1>DNS Lookup</h1>
          <p>Query DNS records for any domain. Supports A, AAAA, CNAME, MX, TXT and more.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="domain-search-bar">
        <input
          className="domain-input"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="example.com"
          spellCheck="false"
        />
        <select className="domain-select" value={recordType} onChange={e => setRecordType(e.target.value)}>
          {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="domain-select" value={dnsServer.label} onChange={e => setDnsServer(DNS_SERVERS.find(s => s.label === e.target.value))}>
          {DNS_SERVERS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={lookup} disabled={loading || !domain.trim()}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {loading ? 'Looking up...' : 'Lookup'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="domain-error-box">
          <AlertTriangle size={18} />
          <span><strong>DNS Error:</strong> {error}</span>
        </div>
      )}

      {/* Results */}
      {results && !error && (
        <div className="domain-results-card">
          <div className="domain-results-header">
            <span className="dns-record-badge" style={{ background: TYPE_COLORS[recordType] }}>
              {recordType}
            </span>
            <span className="domain-results-title">{domain.trim()}</span>
            <span className="domain-results-meta">via {dnsServer.label}</span>
            {results.TC && <span className="badge badge-warning">Truncated</span>}
          </div>

          {results.Answer && results.Answer.length > 0 ? (
            <table className="dns-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>TTL</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {results.Answer.map((record, i) => (
                  <tr key={i}>
                    <td className="dns-name">{record.name}</td>
                    <td>
                      <span className="dns-type-chip" style={{ color: TYPE_COLORS[RECORD_TYPES[record.type - 1]] || '#94a3b8' }}>
                        {record.type}
                      </span>
                    </td>
                    <td className="dns-ttl">{record.TTL}s</td>
                    <td className="dns-value">{formatRdata(record)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="domain-empty-state">
              <RefreshCw size={20} />
              <p>No {recordType} records found for <strong>{domain}</strong></p>
            </div>
          )}

          {results.Authority && results.Authority.length > 0 && (
            <div className="dns-authority">
              <span className="dns-authority-label">Authority:</span>
              {results.Authority.map((a, i) => <span key={i} className="dns-authority-item">{a.data}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DnsLookup;
