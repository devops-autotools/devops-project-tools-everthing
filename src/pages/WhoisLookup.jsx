import React, { useState } from 'react';
import { Search, BookOpen, Loader2, AlertTriangle, Calendar, Server, User, Shield, Globe } from 'lucide-react';

const WhoisLookup = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    const d = domain.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!d) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // RDAP is the modern replacement for WHOIS - supports CORS natively
      const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`Domain "${d}" not found in RDAP registry.`);
        throw new Error(`RDAP query failed (HTTP ${res.status})`);
      }
      const data = await res.json();

      // Parse RDAP format into our display format
      const events = {};
      (data.events || []).forEach(e => { events[e.eventAction] = e.eventDate; });

      const nameservers = (data.nameservers || []).map(ns => ns.ldhName || ns.unicodeName || '');
      const registrant = data.entities?.find(e => e.roles?.includes('registrant'));
      const registrar = data.entities?.find(e => e.roles?.includes('registrar'));

      const getVcard = (entity) => {
        if (!entity?.vcardArray?.[1]) return {};
        const vcard = {};
        entity.vcardArray[1].forEach(([type, , , value]) => {
          if (type === 'org') vcard.organization = value;
          if (type === 'adr') vcard.country = Array.isArray(value) ? value[6] : '';
          if (type === 'fn') vcard.name = value;
        });
        return vcard;
      };

      setResult({
        domain: { name: data.ldhName || d, name_servers: nameservers, status: data.status, created_date: events['registration'], updated_date: events['last changed'], expiration_date: events['expiration'] },
        registrar: { name: registrar ? (getVcard(registrar).name || registrar.handle) : null, iana_id: registrar?.handle, url: registrar?.links?.[0]?.href },
        registrant: registrant ? getVcard(registrant) : null,
      });
    } catch (e) {
      setError(e.message.includes('fetch') ? 'Network error — check your internet connection.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') lookup(); };

  const formatDate = (str) => {
    if (!str) return null;
    try { return new Date(str).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }); }
    catch { return str; }
  };

  const getDaysUntil = (str) => {
    if (!str) return null;
    const days = Math.ceil((new Date(str) - Date.now()) / 86400000);
    return days;
  };

  const domainStatus = result ? getDaysUntil(result.domain?.expiration_date) : null;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          <BookOpen size={28} />
        </div>
        <div>
          <h1>WHOIS Lookup</h1>
          <p>Domain registration info, expiry date, registrar and nameservers.</p>
        </div>
      </div>

      <div className="domain-search-bar">
        <input
          className="domain-input"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="example.com"
          spellCheck="false"
        />
        <button className="btn btn-primary" onClick={lookup} disabled={loading || !domain.trim()}>
          {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          {loading ? 'Looking up...' : 'WHOIS'}
        </button>
      </div>

      {error && (
        <div className="domain-error-box">
          <AlertTriangle size={18} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {result && (
        <div className="whois-grid">
          {/* Domain Status Card */}
          <div className="whois-card whois-card-full">
            <div className="whois-domain-header">
              <Globe size={22} />
              <h2>{result.domain?.name || domain}</h2>
              {domainStatus !== null && (
                <span className={`badge ${domainStatus < 0 ? 'badge-error' : domainStatus < 30 ? 'badge-warning' : 'badge-success'}`}>
                  {domainStatus < 0 ? '❌ Expired' : domainStatus < 30 ? `⚠️ Expires in ${domainStatus}d` : `✅ ${domainStatus}d remaining`}
                </span>
              )}
            </div>
          </div>

          {/* Dates Card */}
          <div className="whois-card">
            <div className="whois-card-header"><Calendar size={16} /> Important Dates</div>
            <div className="whois-row"><span>Created</span><span>{formatDate(result.domain?.created_date) || '—'}</span></div>
            <div className="whois-row"><span>Updated</span><span>{formatDate(result.domain?.updated_date) || '—'}</span></div>
            <div className={`whois-row ${domainStatus !== null && domainStatus < 30 ? 'whois-row-warn' : ''}`}>
              <span>Expires</span>
              <span>{formatDate(result.domain?.expiration_date) || '—'}</span>
            </div>
          </div>

          {/* Registrar Card */}
          <div className="whois-card">
            <div className="whois-card-header"><Shield size={16} /> Registrar</div>
            <div className="whois-row"><span>Name</span><span>{result.registrar?.name || '—'}</span></div>
            <div className="whois-row"><span>IANA ID</span><span>{result.registrar?.iana_id || '—'}</span></div>
            <div className="whois-row"><span>URL</span>
              <span>{result.registrar?.url
                ? <a href={result.registrar.url} target="_blank" rel="noreferrer">{result.registrar.url}</a>
                : '—'}
              </span>
            </div>
          </div>

          {/* Registrant */}
          {result.registrant && (
            <div className="whois-card">
              <div className="whois-card-header"><User size={16} /> Registrant</div>
              <div className="whois-row"><span>Org</span><span>{result.registrant.organization || 'Privacy Protected'}</span></div>
              <div className="whois-row"><span>Country</span><span>{result.registrant.country || '—'}</span></div>
              <div className="whois-row"><span>State</span><span>{result.registrant.state || '—'}</span></div>
            </div>
          )}

          {/* Nameservers */}
          {result.domain?.name_servers && (
            <div className="whois-card">
              <div className="whois-card-header"><Server size={16} /> Nameservers</div>
              {result.domain.name_servers.map((ns, i) => (
                <div key={i} className="whois-ns-item">{ns.toLowerCase()}</div>
              ))}
            </div>
          )}

          {/* Status */}
          {result.domain?.status && (
            <div className="whois-card">
              <div className="whois-card-header">📋 Domain Status</div>
              {(Array.isArray(result.domain.status) ? result.domain.status : [result.domain.status]).map((s, i) => (
                <div key={i} className="whois-status-item">{s.split(' ')[0]}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhoisLookup;
