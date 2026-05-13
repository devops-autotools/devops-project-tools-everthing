import React, { useState, useMemo } from 'react';
import { Regex, Copy, Trash2, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const FLAG_LIST = [
  { flag: 'g', label: 'Global', desc: 'Find all matches' },
  { flag: 'i', label: 'Case insensitive', desc: 'Ignore case' },
  { flag: 'm', label: 'Multiline', desc: '^ and $ match line start/end' },
  { flag: 's', label: 'Dotall', desc: '. matches newline' },
];

const EXAMPLES = [
  { label: 'Email',      pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi', text: 'Contact us at hello@example.com or support@domain.co.uk for help.' },
  { label: 'IPv4',       pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', text: 'Server IPs: 192.168.1.1, 10.0.0.255, and 172.16.254.1' },
  { label: 'URL',        pattern: 'https?://[^\\s]+', flags: 'gi', text: 'Visit https://github.com or http://example.org/path?q=1 for more info.' },
  { label: 'Docker tag', pattern: '([a-z0-9]+(?:[._-][a-z0-9]+)*)(?::([\\w.-]+))?', flags: 'i', text: 'nginx:1.25-alpine\nnode:20\npostgres:16.2' },
  { label: 'K8s label',  pattern: '([a-zA-Z][\\w.-]*)=([\\w.-]+)', flags: 'g', text: 'app=frontend tier=web env=production version=1.2.3' },
  { label: 'Log level',  pattern: '\\b(ERROR|WARN|INFO|DEBUG)\\b', flags: 'gi', text: '[INFO] Server started\n[ERROR] Connection refused\n[WARN] High memory usage\n[DEBUG] Query took 2ms' },
];

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [showGroups, setShowGroups] = useState(true);
  const [copied, setCopied] = useState('');

  const result = useMemo(() => {
    if (!pattern || !testText) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches = [];
      if (flags.includes('g')) {
        let m;
        const reG = new RegExp(pattern, flags);
        while ((m = reG.exec(testText)) !== null) {
          matches.push({ match: m[0], index: m.index, end: m.index + m[0].length, groups: m.slice(1) });
          if (m[0].length === 0) reG.lastIndex++;
        }
      } else {
        const m = re.exec(testText);
        if (m) matches.push({ match: m[0], index: m.index, end: m.index + m[0].length, groups: m.slice(1) });
      }
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, testText]);

  // Build highlighted segments
  const segments = useMemo(() => {
    if (!result || result.error || !result.matches.length) return null;
    const segs = [];
    let pos = 0;
    result.matches.forEach((m, i) => {
      if (m.index > pos) segs.push({ text: testText.slice(pos, m.index), highlight: false });
      segs.push({ text: m.match, highlight: true, color: COLORS[i % COLORS.length], idx: i });
      pos = m.end;
    });
    if (pos < testText.length) segs.push({ text: testText.slice(pos), highlight: false });
    return segs;
  }, [result, testText]);

  const toggleFlag = (f) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  const loadExample = (ex) => {
    setPattern(ex.pattern); setFlags(ex.flags); setTestText(ex.text);
  };

  const copyText = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 2000);
  };

  const hasMatches = result && !result.error && result.matches.length > 0;
  const noMatches  = result && !result.error && result.matches.length === 0 && pattern && testText;
  const hasError   = result && result.error;
  const hasGroups  = hasMatches && result.matches.some(m => m.groups.length > 0);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          <Regex size={28} />
        </div>
        <div>
          <h1>Regex Tester</h1>
          <p>Test regular expressions in real-time with match highlighting and capture group inspection.</p>
        </div>
      </div>

      {/* Quick examples */}
      <div className="regex-examples">
        {EXAMPLES.map(ex => (
          <button key={ex.label} className="regex-example-chip" onClick={() => loadExample(ex)}>
            {ex.label}
          </button>
        ))}
      </div>

      {/* Pattern input row */}
      <div className="regex-pattern-row">
        <div className="regex-pattern-wrap">
          <span className="regex-delim">/</span>
          <input
            id="regex-pattern"
            className="regex-pattern-input"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            spellCheck="false"
          />
          <span className="regex-delim">/</span>
          <span className="regex-flags-display">{flags}</span>
        </div>

        <div className="regex-flags-row">
          {FLAG_LIST.map(f => (
            <button
              key={f.flag}
              className={`regex-flag-btn ${flags.includes(f.flag) ? 'active' : ''}`}
              onClick={() => toggleFlag(f.flag)}
              title={f.desc}
            >
              <span className="regex-flag-char">{f.flag}</span>
              <span className="regex-flag-label">{f.label}</span>
            </button>
          ))}
          {pattern && (
            <button className="btn btn-small" onClick={() => copyText(`/${pattern}/${flags}`, 'pattern')} style={{marginLeft:8}}>
              <Copy size={13}/> {copied==='pattern' ? '✓' : 'Copy'}
            </button>
          )}
          <button className="btn btn-small btn-danger" onClick={() => { setPattern(''); setTestText(''); }} style={{marginLeft:4}}>
            <Trash2 size={13}/> Clear
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="regex-status">
        {!pattern && <span className="regex-status-idle">Enter a pattern above to start testing</span>}
        {hasError   && <span className="regex-status-error"><XCircle size={14}/> Invalid regex: {result.error}</span>}
        {noMatches  && <span className="regex-status-nomatch"><AlertTriangle size={14}/> No matches found</span>}
        {hasMatches && (
          <span className="regex-status-match">
            <CheckCircle2 size={14} color="#10b981"/>
            {result.matches.length} match{result.matches.length!==1?'es':''} found
            {hasGroups && ` · ${result.matches[0].groups.length} capture group${result.matches[0].groups.length!==1?'s':''}`}
          </span>
        )}
      </div>

      {/* Main content: test text + groups */}
      <div className="regex-main">
        {/* Left: test text + highlighted result */}
        <div className="regex-editor-col">
          <div className="regex-editor-panel">
            <div className="df3-panel-header" style={{borderRadius:'var(--radius-lg) var(--radius-lg) 0 0'}}>
              <span className="df3-panel-title">Test String</span>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-small" onClick={()=>copyText(testText,'text')} disabled={!testText}>
                  <Copy size={13}/> {copied==='text'?'✓ Copied!':'Copy'}
                </button>
                <button className="btn btn-small btn-danger" onClick={()=>setTestText('')} disabled={!testText}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
            <textarea
              id="regex-test-input"
              className="code-editor regex-textarea"
              value={testText}
              onChange={e => setTestText(e.target.value)}
              placeholder="Paste your test string here..."
              spellCheck="false"
            />
          </div>

          {/* Highlighted preview */}
          {(hasMatches || noMatches) && (
            <div className="regex-preview-panel">
              <div className="df3-panel-header">
                <span className="df3-panel-title">Match Preview</span>
              </div>
              <div className="regex-preview-body">
                {noMatches && <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>No matches in text</span>}
                {segments && (
                  <pre className="regex-preview-text">
                    {segments.map((seg, i) =>
                      seg.highlight
                        ? <mark key={i} className="regex-mark" style={{background: seg.color+'33', borderBottom:`2px solid ${seg.color}`, color: seg.color}}>{seg.text}</mark>
                        : <span key={i}>{seg.text}</span>
                    )}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: matches table */}
        <div className="regex-results-col">
          {!hasMatches && !hasError && (
            <div className="regex-results-empty">
              <Regex size={36} strokeWidth={1}/>
              <p>Matches and groups will appear here</p>
            </div>
          )}

          {hasMatches && (
            <>
              <div className="regex-matches-panel">
                <div className="df3-panel-header">
                  <span className="df3-panel-title">All Matches ({result.matches.length})</span>
                </div>
                <div className="regex-matches-list">
                  {result.matches.map((m, i) => (
                    <div key={i} className="regex-match-item" style={{borderLeft:`3px solid ${COLORS[i%COLORS.length]}`}}>
                      <div className="regex-match-header">
                        <span className="regex-match-badge" style={{background:COLORS[i%COLORS.length]+'22',color:COLORS[i%COLORS.length]}}>#{i+1}</span>
                        <code className="regex-match-value">{m.match || '(empty)'}</code>
                        <span className="regex-match-pos">@{m.index}–{m.end}</span>
                      </div>
                      {m.groups.length > 0 && (
                        <div className="regex-groups">
                          {m.groups.map((g, gi) => (
                            <span key={gi} className="regex-group-chip">
                              <span className="regex-group-idx">Group {gi+1}</span>
                              <code>{g ?? '(undefined)'}</code>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cheatsheet */}
              <div className="regex-cheatsheet">
                <button className="optimized-toggle" onClick={()=>setShowGroups(v=>!v)} style={{width:'100%',padding:'10px 14px'}}>
                  <Regex size={14}/>
                  <span style={{flex:1,textAlign:'left',fontSize:'0.82rem'}}>Quick Reference</span>
                  {showGroups?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                </button>
                {showGroups && (
                  <div className="regex-cheat-grid">
                    {[
                      ['.','Any character (except newline)'],['\\d','Digit [0-9]'],['\\w','Word char [a-zA-Z0-9_]'],
                      ['\\s','Whitespace'],['\\b','Word boundary'],['*','0 or more'],['+','1 or more'],
                      ['?','0 or 1 (optional)'],['{}','Quantifier {n} or {n,m}'],['[]','Character class'],
                      ['^','Start of string/line'],['$','End of string/line'],['()','Capture group'],
                      ['(?:)','Non-capture group'],['|','Alternation (OR)'],['\\','Escape special char'],
                    ].map(([sym,desc])=>(
                      <div key={sym} className="regex-cheat-item">
                        <code className="regex-cheat-sym">{sym}</code>
                        <span className="regex-cheat-desc">{desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
