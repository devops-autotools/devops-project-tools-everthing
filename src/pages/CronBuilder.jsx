import React, { useState, useMemo } from 'react';
import { Clock, Copy, CheckCircle2, RefreshCw } from 'lucide-react';

// Parse next N cron execution times
const getNextExecutions = (expression, count = 5) => {
  try {
    const [min, hour, dom, month, dow] = expression.split(' ');
    const results = [];
    const now = new Date();
    let cursor = new Date(now);
    cursor.setSeconds(0);
    cursor.setMilliseconds(0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    const matchField = (value, field) => {
      if (field === '*') return true;
      if (field.includes('/')) {
        const [base, step] = field.split('/');
        const start = base === '*' ? 0 : parseInt(base);
        return (value - start) % parseInt(step) === 0 && value >= start;
      }
      if (field.includes('-')) {
        const [from, to] = field.split('-').map(Number);
        return value >= from && value <= to;
      }
      if (field.includes(',')) {
        return field.split(',').map(Number).includes(value);
      }
      return parseInt(field) === value;
    };

    let attempts = 0;
    while (results.length < count && attempts < 50000) {
      attempts++;
      const m = cursor.getMinutes();
      const h = cursor.getHours();
      const d = cursor.getDate();
      const mo = cursor.getMonth() + 1;
      const dw = cursor.getDay();

      if (
        matchField(mo, month) &&
        matchField(d, dom) &&
        matchField(dw, dow) &&
        matchField(h, hour) &&
        matchField(m, min)
      ) {
        results.push(new Date(cursor));
        cursor.setMinutes(cursor.getMinutes() + 1);
      } else {
        cursor.setMinutes(cursor.getMinutes() + 1);
      }
    }
    return results;
  } catch {
    return [];
  }
};

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at noon', value: '0 12 * * *' },
  { label: 'Every Monday', value: '0 9 * * 1' },
  { label: 'Every weekday', value: '0 9 * * 1-5' },
  { label: 'Weekly Sunday', value: '0 0 * * 0' },
  { label: 'Monthly 1st', value: '0 0 1 * *' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CronBuilder = () => {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [copied, setCopied] = useState(false);
  const [rawInput, setRawInput] = useState('0 9 * * 1-5');

  const isValid = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    return parts.length === 5;
  }, [expression]);

  const nextRuns = useMemo(() => {
    if (!isValid) return [];
    return getNextExecutions(expression);
  }, [expression, isValid]);

  const handleRawChange = (val) => {
    setRawInput(val);
    setExpression(val);
  };

  const handlePreset = (val) => {
    setExpression(val);
    setRawInput(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = expression.trim().split(/\s+/);
  const [cronMin, cronHour, cronDom, cronMonth, cronDow] = parts.length === 5 ? parts : ['*', '*', '*', '*', '*'];

  const formatDate = (date) => {
    return date.toLocaleString('en-GB', {
      weekday: 'short', year: 'numeric', month: 'short',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon">
          <Clock size={28} />
        </div>
        <div>
          <h1>Cron Expression Builder</h1>
          <p>Build and validate cron expressions with preview of next scheduled runs.</p>
        </div>
      </div>

      <div className="cron-layout">
        {/* Left: Expression + Presets */}
        <div className="cron-left">
          {/* Raw expression input */}
          <div className="cron-expression-box">
            <label className="field-label">Cron Expression</label>
            <div className="cron-input-row">
              <input
                className="cron-raw-input"
                value={rawInput}
                onChange={(e) => handleRawChange(e.target.value)}
                placeholder="* * * * *"
                spellCheck="false"
              />
              <button className="btn btn-small btn-primary" onClick={handleCopy} disabled={!isValid}>
                {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <div className="cron-parts-labels">
              {['Minute', 'Hour', 'Day', 'Month', 'Weekday'].map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
            {!isValid && (
              <p className="cron-error-hint">Invalid expression — must have exactly 5 fields.</p>
            )}
          </div>

          {/* Visual breakdown */}
          {isValid && (
            <div className="cron-breakdown">
              <h3>Expression Breakdown</h3>
              <div className="cron-breakdown-grid">
                {[
                  { label: 'Minute (0-59)', value: cronMin },
                  { label: 'Hour (0-23)', value: cronHour },
                  { label: 'Day of Month (1-31)', value: cronDom },
                  { label: 'Month (1-12)', value: cronMonth },
                  { label: 'Day of Week (0-6)', value: cronDow },
                ].map((f, i) => (
                  <div key={i} className="cron-field-chip">
                    <span className="cron-field-value">{f.value}</span>
                    <span className="cron-field-label">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presets */}
          <div className="cron-presets">
            <h3>Quick Presets</h3>
            <div className="cron-preset-grid">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`cron-preset-btn ${expression === p.value ? 'active' : ''}`}
                  onClick={() => handlePreset(p.value)}
                >
                  <span className="preset-label">{p.label}</span>
                  <span className="preset-value">{p.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Next runs preview */}
        <div className="cron-right">
          <div className="cron-next-runs">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} />
              Next 5 Scheduled Runs
            </h3>
            {isValid && nextRuns.length > 0 ? (
              <ol className="cron-runs-list">
                {nextRuns.map((date, i) => (
                  <li key={i} className="cron-run-item">
                    <span className="run-index">#{i + 1}</span>
                    <span className="run-date">{formatDate(date)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="cron-no-preview">Enter a valid cron expression to see upcoming runs.</p>
            )}
          </div>

          {/* Cheatsheet */}
          <div className="cron-cheatsheet">
            <h3>Syntax Cheatsheet</h3>
            <table className="cheat-table">
              <tbody>
                <tr><td><code>*</code></td><td>Any value</td></tr>
                <tr><td><code>,</code></td><td>List: <code>1,3,5</code></td></tr>
                <tr><td><code>-</code></td><td>Range: <code>1-5</code></td></tr>
                <tr><td><code>/</code></td><td>Step: <code>*/5</code></td></tr>
                <tr><td><code>0-6</code></td><td>Sun=0, Mon=1...Sat=6</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronBuilder;
