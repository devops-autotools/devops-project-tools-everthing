import React, { useState, useCallback } from 'react';
import {
  FileText, AlertTriangle, CheckCircle2, Info, XCircle,
  Clipboard, Trash2, Download, Sparkles, Copy
} from 'lucide-react';

const RULES = [
  { id: 'no-latest-tag', level: 'error', title: 'Avoid using `:latest` tag',
    check: (lines) => lines.flatMap((line, i) => /^\s*FROM\s+\S+:latest(\s|$)/i.test(line) ? [{ line: i+1, code: line.trim(), suggestion: 'Pin to a specific version tag, e.g. `node:20-alpine`' }] : []) },
  { id: 'no-tag', level: 'warning', title: 'Base image has no tag',
    check: (lines) => lines.flatMap((line, i) => /^\s*FROM\s+[^\s:@]+\s*$/i.test(line) && !/^\s*FROM\s+scratch\s*$/i.test(line) ? [{ line: i+1, code: line.trim(), suggestion: 'Always specify a tag or digest to ensure reproducible builds' }] : []) },
  { id: 'use-specific-copy', level: 'warning', title: 'Avoid `COPY . .` — copies everything',
    check: (lines) => lines.flatMap((line, i) => /^\s*COPY\s+\.\s+\./i.test(line) ? [{ line: i+1, code: line.trim(), suggestion: 'Use `.dockerignore` to exclude node_modules, .git, etc.' }] : []) },
  { id: 'apt-no-clean', level: 'error', title: '`apt-get install` without `--no-install-recommends`',
    check: (lines) => lines.flatMap((line, i) => /apt-get\s+install/i.test(line) && !/no-install-recommends/i.test(line) ? [{ line: i+1, code: line.trim(), suggestion: 'Add `--no-install-recommends` and `&& rm -rf /var/lib/apt/lists/*`' }] : []) },
  { id: 'apt-update-separate', level: 'warning', title: '`apt-get update` in separate RUN layer',
    check: (lines) => lines.flatMap((line, i) => /^\s*RUN\s+apt-get\s+update\s*$/i.test(line) ? [{ line: i+1, code: line.trim(), suggestion: 'Combine: `RUN apt-get update && apt-get install -y ...`' }] : []) },
  { id: 'run-multiple-commands', level: 'info', title: 'Multiple consecutive `RUN` instructions',
    check: (lines) => {
      const runs = []; let c = 0, fl = -1;
      lines.forEach((line, i) => {
        if (/^\s*RUN\s/i.test(line)) { if (c===0) fl=i+1; c++; }
        else if (line.trim() && !/^\s*#/.test(line)) { if (c>=3) runs.push({line:fl, code:`${c} consecutive RUN instructions`, suggestion:'Chain with `&&` to reduce image layers'}); c=0; }
      });
      if (c>=3) runs.push({line:fl, code:`${c} consecutive RUN instructions`, suggestion:'Chain with `&&`'});
      return runs;
    }},
  { id: 'no-root-user', level: 'warning', title: 'No non-root USER defined',
    check: (lines) => lines.some(l=>/^\s*FROM\s/i.test(l)) && !lines.some(l=>/^\s*USER\s+(?!root)/i.test(l)) ? [{line:null,code:null,suggestion:'Add `USER nonroot` before CMD. Create: `RUN addgroup -S app && adduser -S app -G app`'}] : [] },
  { id: 'use-workdir', level: 'info', title: 'No `WORKDIR` set',
    check: (lines) => lines.some(l=>/^\s*(COPY|RUN|CMD|ENTRYPOINT)\s/i.test(l)) && !lines.some(l=>/^\s*WORKDIR\s/i.test(l)) ? [{line:null,code:null,suggestion:'Set `WORKDIR /app` after FROM'}] : [] },
  { id: 'pin-pip', level: 'warning', title: '`pip install` without pinned versions',
    check: (lines) => lines.flatMap((line, i) => /pip\s+install\s+(?!-r)[a-z]/i.test(line) && !/==/.test(line) ? [{line:i+1,code:line.trim(),suggestion:'Pin versions: `pip install flask==3.0.0`'}] : []) },
  { id: 'use-npm-ci', level: 'info', title: 'Use `npm ci` instead of `npm install`',
    check: (lines) => lines.flatMap((line, i) => /^\s*RUN\s+npm\s+install\b/i.test(line) ? [{line:i+1,code:line.trim(),suggestion:'`npm ci` installs exact lock-file versions — faster in CI/CD'}] : []) },
  { id: 'expose-port', level: 'info', title: 'No `EXPOSE` instruction',
    check: (lines) => lines.some(l=>/^\s*FROM\s/i.test(l)) && !lines.some(l=>/^\s*EXPOSE\s/i.test(l)) ? [{line:null,code:null,suggestion:'Add `EXPOSE <port>` to document the container port'}] : [] },
  { id: 'no-add-for-files', level: 'warning', title: '`ADD` used instead of `COPY` for local files',
    check: (lines) => lines.flatMap((line, i) => /^\s*ADD\s/i.test(line) && !/https?:\/\//i.test(line) && !/.tar\./i.test(line) ? [{line:i+1,code:line.trim(),suggestion:'Use `COPY` — `ADD` has implicit behaviors (auto-extract tar, fetch URLs)'}] : []) },
  { id: 'healthcheck', level: 'info', title: 'No `HEALTHCHECK` defined',
    check: (lines) => lines.some(l=>/^\s*FROM\s/i.test(l)) && !lines.some(l=>/^\s*HEALTHCHECK\s/i.test(l)) ? [{line:null,code:null,suggestion:'Add: `HEALTHCHECK CMD curl -f http://localhost/ || exit 1`'}] : [] },
  { id: 'cmd-form', level: 'warning', title: '`CMD` using shell form instead of exec form',
    check: (lines) => lines.flatMap((line, i) => { const m=line.match(/^\s*CMD\s+([^[\s])/i); return m?[{line:i+1,code:line.trim(),suggestion:'Use exec form: `CMD ["node", "server.js"]`'}]:[]; }) },
  { id: 'entrypoint-form', level: 'warning', title: '`ENTRYPOINT` using shell form',
    check: (lines) => lines.flatMap((line, i) => { const m=line.match(/^\s*ENTRYPOINT\s+([^[\s])/i); return m?[{line:i+1,code:line.trim(),suggestion:'Use exec form: `ENTRYPOINT ["./entrypoint.sh"]`'}]:[]; }) },
  { id: 'multi-stage', level: 'info', title: 'Consider multi-stage build',
    check: (lines) => lines.filter(l=>/^\s*FROM\s/i.test(l)).length===1 && lines.some(l=>/\b(go build|mvn|gradle|npm run build|cargo build|gcc|make)\b/i.test(l)) ? [{line:null,code:null,suggestion:'Use multi-stage builds to keep the final image small'}] : [] },
  { id: 'secrets-in-env', level: 'error', title: 'Possible secret in `ENV` or `ARG`',
    check: (lines) => lines.flatMap((line, i) => /^\s*(ENV|ARG)\s.*\b(password|secret|token|key|api_key|passwd|pwd)\s*[=:]/i.test(line) ? [{line:i+1,code:line.trim().replace(/=.*/,'=***'),suggestion:'Never hardcode secrets. Use runtime env vars or Docker secrets.'}] : []) },
];

const generateBestVersion = (rawText, findings) => {
  const ids = new Set(findings.map(f => f.id));
  let lines = rawText.split('\n');
  const applied = [];

  lines = lines.map(line => {
    if (ids.has('no-latest-tag') && /^\s*FROM\s+\S+:latest(\s|$)/i.test(line)) {
      applied.push('Pinned :latest → :20-alpine (update to your actual version)');
      return line.replace(/:latest(\s|$)/i, ':20-alpine$1');
    }
    if (ids.has('no-tag') && /^\s*FROM\s+[^\s:@]+\s*$/i.test(line) && !/^\s*FROM\s+scratch\s*$/i.test(line)) {
      applied.push('Added version tag placeholder'); return line.trimEnd() + ' # TODO: pin version';
    }
    if (ids.has('use-specific-copy') && /^\s*COPY\s+\.\s+\./i.test(line)) {
      applied.push('Added .dockerignore reminder'); return '# Tip: create .dockerignore to exclude node_modules, .git\n' + line;
    }
    if (ids.has('apt-no-clean') && /apt-get\s+install/i.test(line) && !/no-install-recommends/i.test(line)) {
      let f = line.replace(/(apt-get\s+install)/i, '$1 --no-install-recommends');
      if (!f.includes('rm -rf /var/lib/apt/lists')) f = f.trimEnd() + ' \\\n    && rm -rf /var/lib/apt/lists/*';
      applied.push('Added --no-install-recommends + apt cache cleanup'); return f;
    }
    if (ids.has('no-add-for-files') && /^\s*ADD\s/i.test(line) && !/https?:\/\//i.test(line) && !/.tar\./i.test(line)) {
      applied.push('Replaced ADD with COPY'); return line.replace(/^(\s*)ADD(\s)/i, '$1COPY$2');
    }
    if (ids.has('cmd-form')) { const m=line.match(/^(\s*CMD\s+)(.+)$/i); if(m&&!m[2].trim().startsWith('[')){ const p=m[2].trim().split(/\s+/); applied.push('Converted CMD to exec form'); return `${m[1]}["${p.join('", "')}"]`; } }
    if (ids.has('entrypoint-form')) { const m=line.match(/^(\s*ENTRYPOINT\s+)(.+)$/i); if(m&&!m[2].trim().startsWith('[')){ const p=m[2].trim().split(/\s+/); applied.push('Converted ENTRYPOINT to exec form'); return `${m[1]}["${p.join('", "')}"]`; } }
    if (ids.has('use-npm-ci') && /^\s*RUN\s+npm\s+install\b/i.test(line)) { applied.push('Replaced npm install with npm ci'); return line.replace(/npm\s+install\b/i,'npm ci'); }
    if (ids.has('secrets-in-env') && /^\s*(ENV|ARG)\s.*\b(password|secret|token|key|api_key|passwd|pwd)\s*[=:]/i.test(line)) {
      applied.push('Removed hardcoded secret'); return `# SECURITY: do not hardcode secrets!\n# ${line.trim()}\n# Pass at runtime: docker run -e MY_SECRET=...`;
    }
    return line;
  });

  if (ids.has('use-workdir') && !lines.some(l=>/^\s*WORKDIR\s/i.test(l))) {
    const fi=lines.findIndex(l=>/^\s*FROM\s/i.test(l));
    if(fi!==-1){lines.splice(fi+1,0,'','WORKDIR /app'); applied.push('Added WORKDIR /app after FROM');}
  }
  if (ids.has('no-root-user')) {
    const ci=lines.findIndex(l=>/^\s*(CMD|ENTRYPOINT)\s/i.test(l));
    const ins=['','# Run as non-root for security','RUN addgroup -S appgroup && adduser -S appuser -G appgroup','USER appuser',''];
    if(ci!==-1) lines.splice(ci,0,...ins); else lines.push(...ins);
    applied.push('Added non-root USER before CMD');
  }
  if (ids.has('expose-port')) {
    const ci=lines.findIndex(l=>/^\s*(CMD|ENTRYPOINT)\s/i.test(l));
    if(ci!==-1){lines.splice(ci,0,'EXPOSE 8080  # TODO: set your actual port'); applied.push('Added EXPOSE placeholder');}
  }
  if (ids.has('healthcheck')) {
    const ci=lines.findIndex(l=>/^\s*CMD\s/i.test(l));
    if(ci!==-1){lines.splice(ci,0,'HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -f http://localhost:8080/health || exit 1'); applied.push('Added HEALTHCHECK');}
  }
  return { optimized: lines.join('\n'), applied };
};

const LEVEL_CONFIG = {
  error:   { icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  label: 'Error' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Warning' },
  info:    { icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: 'Info' },
};

const EXAMPLE = `FROM node:latest

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

ENV SECRET_KEY=mysupersecret123

CMD node server.js
`;

const DockerfileLinter = () => {
  const [content, setContent] = useState('');
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  const lint = useCallback((text) => {
    if (!text.trim()) { setResults(null); return; }
    const lines = text.split('\n');
    const findings = [];
    RULES.forEach(rule => rule.check(lines).forEach(m => findings.push({ ...rule, ...m })));
    findings.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.level] !== order[b.level] ? order[a.level] - order[b.level] : (a.line||9999)-(b.line||9999);
    });
    const { optimized, applied } = generateBestVersion(text, findings);
    setResults({ findings, optimized, applied,
      errors: findings.filter(f=>f.level==='error').length,
      warnings: findings.filter(f=>f.level==='warning').length,
      infos: findings.filter(f=>f.level==='info').length,
    });
  }, []);

  const handleChange = (e) => { setContent(e.target.value); lint(e.target.value); };
  const handleClear  = () => { setContent(''); setResults(null); };
  const handleExample = () => { setContent(EXAMPLE); lint(EXAMPLE); };
  const handlePaste = async () => { const t = await navigator.clipboard.readText(); setContent(t); lint(t); };
  const copyOptimized = async () => {
    if (!results?.optimized) return;
    await navigator.clipboard.writeText(results.optimized);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const downloadReport = () => {
    if (!results) return;
    const out = ['Dockerfile Lint Report', `Generated: ${new Date().toLocaleString()}`, '',
      `Summary: ${results.errors} errors, ${results.warnings} warnings, ${results.infos} info`, ''];
    results.findings.forEach(f => { out.push(`[${f.level.toUpperCase()}] ${f.title}`); if(f.line) out.push(`  Line ${f.line}: ${f.code}`); out.push(`  → ${f.suggestion}`, ''); });
    const blob = new Blob([out.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='dockerfile-lint-report.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
          <FileText size={28} />
        </div>
        <div>
          <h1>Dockerfile Linter</h1>
          <p>Analyze your Dockerfile for anti-patterns, security issues, and best practices.</p>
        </div>
      </div>

      {/* ── 3-panel layout ── */}
      <div className="df3-layout">

        {/* Panel 1 — Input */}
        <div className="df3-panel df3-input">
          <div className="df3-panel-header">
            <span className="df3-panel-title"><FileText size={14} /> Dockerfile</span>
            <div className="df3-panel-actions">
              <button className="btn btn-small" onClick={handlePaste}><Clipboard size={13} /> Paste</button>
              <button className="btn btn-small" onClick={handleExample}><FileText size={13} /> Example</button>
              <button className="btn btn-small btn-danger" onClick={handleClear} disabled={!content}><Trash2 size={13} /> Clear</button>
            </div>
          </div>
          <textarea
            className="code-editor df3-editor"
            value={content}
            onChange={handleChange}
            placeholder={`FROM node:20-alpine\n\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\n\nUSER node\nEXPOSE 3000\nCMD ["node", "server.js"]`}
            spellCheck="false"
          />
          {content && <div className="dockerfile-line-count">{content.split('\n').length} lines</div>}
        </div>

        {/* Panel 2 — Issues */}
        <div className="df3-panel df3-issues">
          <div className="df3-panel-header">
            <span className="df3-panel-title"><AlertTriangle size={14} /> Issues</span>
            {results && (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className="lint-score-counts">
                  <span className="lint-count lint-count-error"><XCircle size={12}/> {results.errors}</span>
                  <span className="lint-count lint-count-warning"><AlertTriangle size={12}/> {results.warnings}</span>
                  <span className="lint-count lint-count-info"><Info size={12}/> {results.infos}</span>
                </div>
                {results.findings.length > 0 && (
                  <button className="btn btn-small" onClick={downloadReport}><Download size={13}/> Report</button>
                )}
              </div>
            )}
          </div>
          <div className="df3-panel-body">
            {!results && (
              <div className="df3-empty"><AlertTriangle size={32} strokeWidth={1}/><p>Issues will appear here after linting</p></div>
            )}
            {results && results.findings.length === 0 && (
              <div className="df3-no-issues"><CheckCircle2 size={32} color="#10b981"/><p>No issues found! 🎉</p></div>
            )}
            {results && results.findings.length > 0 && (
              <div className="dockerfile-findings">
                {results.findings.map((f, i) => {
                  const cfg = LEVEL_CONFIG[f.level];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="lint-finding" style={{ borderLeftColor: cfg.color, background: cfg.bg }}>
                      <div className="lint-finding-header">
                        <Icon size={14} color={cfg.color}/>
                        <span className="lint-finding-title">{f.title}</span>
                        {f.line && <span className="lint-finding-line">L{f.line}</span>}
                        <span className="lint-finding-level" style={{color:cfg.color}}>{cfg.label}</span>
                      </div>
                      {f.code && <div className="lint-finding-code">{f.code}</div>}
                      <div className="lint-finding-suggestion"><span className="lint-fix-label">Fix:</span> {f.suggestion}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel 3 — Optimized */}
        <div className="df3-panel df3-optimized">
          <div className="df3-panel-header">
            <span className="df3-panel-title"><Sparkles size={14} color="#a78bfa"/> Optimized Dockerfile</span>
            {results && results.applied.length > 0 && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="optimized-toggle-sub">{results.applied.length} fixes applied</span>
                <button className="btn btn-small" onClick={copyOptimized}><Copy size={13}/> {copied ? '✓ Copied!' : 'Copy'}</button>
              </div>
            )}
          </div>
          <div className="df3-panel-body">
            {!results && (
              <div className="df3-empty"><Sparkles size={32} strokeWidth={1} color="#a78bfa"/><p>Optimized version will appear here</p></div>
            )}
            {results && results.applied.length === 0 && (
              <div className="df3-no-issues"><CheckCircle2 size={28} color="#10b981"/><p>No fixes needed — Dockerfile looks great!</p></div>
            )}
            {results && results.applied.length > 0 && (
              <>
                <div className="optimized-applied-list" style={{padding:'8px 12px', borderBottom:'1px solid var(--border-color)'}}>
                  {results.applied.map((a, i) => (
                    <div key={i} className="optimized-applied-item"><CheckCircle2 size={11} color="#10b981"/><span>{a}</span></div>
                  ))}
                </div>
                <pre className="df3-code">{results.optimized}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockerfileLinter;
