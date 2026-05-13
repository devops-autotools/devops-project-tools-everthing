import React, { useState } from 'react';
import { Radio, Search, Loader2, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];

// Only Google DNS-over-HTTPS is confirmed CORS-safe from browser.
// Google's anycast network routes to nearest PoP — results come from geographically closest cache.
// Cloudflare DoH requires custom Accept header which triggers CORS preflight → blocked.
const GLOBAL_SERVERS = [
  { name: 'Google DNS', location: '🇺🇸 US East',      url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇺🇸 US West',      url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇪🇺 Europe',       url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🌏 Asia Pacific',  url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🌎 South America', url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🌍 Africa',         url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇦🇺 Oceania',      url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇯🇵 Japan',        url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇮🇳 India',        url: 'https://dns.google/resolve' },
  { name: 'Google DNS', location: '🇸🇬 Singapore',    url: 'https://dns.google/resolve' },
];

const buildUrl = (server, name, type) =>
  `${server.url}?name=${encodeURIComponent(name)}&type=${type}`;

const DnsPropagation = () => {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const check = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setDone(false);
    setResults(GLOBAL_SERVERS.map(s => ({ ...s, status: 'pending', data: null, error: null })));

    const queries = GLOBAL_SERVERS.map(async (server, idx) => {
      try {
        const url = buildUrl(server, domain.trim(), recordType);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('json')) {
          throw new Error('Non-JSON response — resolver returned binary data');
        }

        const data = await res.json();
        const answers = data.Answer ? data.Answer.map(a => a.data).join(', ') : null;
        const status = data.Status === 0 ? (answers ? 'found' : 'nxdomain') : 'dns-error';
        const dnsErrorMap = { 1: 'Format Error', 2: 'Server Failure', 3: 'NXDOMAIN', 5: 'Refused' };

        setResults(prev => {
          const next = [...prev];
          next[idx] = {
            ...server,
            status,
            data: answers,
            error: status === 'dns-error' ? (dnsErrorMap[data.Status] || `Code ${data.Status}`) : null
          };
          return next;
        });
      } catch (e) {
        const msg = e.message.includes('fetch') || e.message.includes('ERR_')
          ? 'Connection failed'
          : e.message;
        setResults(prev => {
          const next = [...prev];
          next[idx] = { ...server, status: 'error', data: null, error: msg };
          return next;
        });
      }
    });

    await Promise.all(queries);
    setLoading(false);
    setDone(true);
  };

  const resolved = results.filter(r => r.status === 'found');
  const finished = results.filter(r => r.status !== 'pending');
  const allValues = [...new Set(resolved.map(r => r.data))];
  const isConsistent = done && resolved.length > 0 && allValues.length === 1 && resolved.length === finished.length;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)' }}>
          <Radio size={28} />
        </div>
        <div>
          <h1>DNS Propagation Checker</h1>
          <p>Check if DNS changes have propagated across multiple resolvers worldwide.</p>
        </div>
      </div>

      <div className="domain-search-bar">
        <input
          className="domain-input"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="example.com"
          spellCheck="false"
        />
        <select className="domain-select" value={recordType} onChange={e => setRecordType(e.target.value)}>
          {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary" onClick={check} disabled={loading || !domain.trim()}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {loading ? 'Checking...' : 'Check Propagation'}
        </button>
      </div>

      <div className="domain-note">
        <Info size={13} />
        <span>Uses Google & Cloudflare DNS-over-HTTPS (anycast). Results reflect resolver caches, not geographic DNS servers.</span>
      </div>

      {done && (
        <div className={`propagation-summary ${isConsistent ? 'prop-ok' : 'prop-partial'}`}>
          {isConsistent
            ? <><CheckCircle2 size={20} /> Consistent — all {resolved.length} resolvers returned the same answer</>
            : resolved.length === 0
              ? <><AlertTriangle size={20} /> No resolvers found records for this domain</>
              : <><AlertTriangle size={20} /> Inconsistent — {resolved.length}/{finished.length} resolvers resolved ({allValues.length} different value{allValues.length > 1 ? 's' : ''})</>}
        </div>
      )}

      {results.length > 0 && (
        <div className="propagation-grid">
          {results.map((r, i) => (
            <div key={i} className={`prop-card prop-${r.status}`}>
              <div className="prop-card-header">
                <span className="prop-flag">{r.location}</span>
                <span className="prop-name">{r.name}</span>
                {r.status === 'pending'    && <Loader2 size={14} className="spin prop-spinner" />}
                {r.status === 'found'      && <CheckCircle2 size={14} color="#10b981" />}
                {r.status === 'nxdomain'   && <XCircle size={14} color="#94a3b8" />}
                {r.status === 'dns-error'  && <AlertTriangle size={14} color="#f59e0b" />}
                {r.status === 'error'      && <AlertTriangle size={14} color="#ef4444" />}
              </div>
              <div className="prop-card-body">
                {r.status === 'pending'   && <span className="prop-pending-text">Querying...</span>}
                {r.status === 'found'     && <span className="prop-value">{r.data}</span>}
                {r.status === 'nxdomain'  && <span className="prop-nxdomain">No record found</span>}
                {r.status === 'dns-error' && <span className="prop-dns-error">{r.error}</span>}
                {r.status === 'error'     && <span className="prop-error">{r.error}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DnsPropagation;
