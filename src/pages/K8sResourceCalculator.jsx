import React, { useState, useMemo } from 'react';
import { Layers, Plus, Trash2, Copy, CheckCircle2, AlertTriangle, Info, Download } from 'lucide-react';

// ─── Unit converters ────────────────────────────────────────────────────────────
const parseCpu = (v, unit) => unit === 'cores' ? parseFloat(v) * 1000 : parseFloat(v); // → millicores
const parseMem = (v, unit) => {
  const n = parseFloat(v);
  if (unit === 'Mi') return n;
  if (unit === 'Gi') return n * 1024;
  return n; // Mi default
};
const fmtCpu = (m) => m >= 1000 ? `${(m/1000).toFixed(2)} cores` : `${Math.round(m)}m`;
const fmtMem = (mi) => mi >= 1024 ? `${(mi/1024).toFixed(2)} Gi` : `${Math.round(mi)} Mi`;

const PRESETS = [
  { label: 'Sidecar', cpuReq: '50', cpuReqU: 'm', cpuLim: '200', cpuLimU: 'm', memReq: '64', memReqU: 'Mi', memLim: '128', memLimU: 'Mi' },
  { label: 'API Server', cpuReq: '250', cpuReqU: 'm', cpuLim: '500', cpuLimU: 'm', memReq: '256', memReqU: 'Mi', memLim: '512', memLimU: 'Mi' },
  { label: 'Worker', cpuReq: '500', cpuReqU: 'm', cpuLim: '1', cpuLimU: 'cores', memReq: '512', memReqU: 'Mi', memLim: '1', memLimU: 'Gi' },
  { label: 'Database', cpuReq: '1', cpuReqU: 'cores', cpuLim: '2', cpuLimU: 'cores', memReq: '1', memReqU: 'Gi', memLim: '2', memLimU: 'Gi' },
  { label: 'Heavy Job', cpuReq: '2', cpuReqU: 'cores', cpuLim: '4', cpuLimU: 'cores', memReq: '2', memReqU: 'Gi', memLim: '4', memLimU: 'Gi' },
];

const mkContainer = (id) => ({
  id, name: `container-${id}`,
  cpuReq: '100', cpuReqU: 'm', cpuLim: '200', cpuLimU: 'm',
  memReq: '128', memReqU: 'Mi', memLim: '256', memLimU: 'Mi',
});

let _id = 1;

const QOS_INFO = {
  Guaranteed: { color: '#10b981', desc: 'All containers have equal requests and limits. Highest priority — never killed unless OOM globally.' },
  Burstable:  { color: '#f59e0b', desc: 'Limits > Requests. Can burst but may be killed under resource pressure.' },
  BestEffort: { color: '#ef4444', desc: 'No requests or limits set. Lowest priority — first to be killed under pressure.' },
};

const K8sResourceCalculator = () => {
  const [containers, setContainers] = useState([mkContainer(_id++)]);
  const [replicas, setReplicas] = useState(1);
  const [nodesCpu, setNodesCpu] = useState('4');   // cores
  const [nodesMem, setNodesMem] = useState('16');   // Gi
  const [copied, setCopied] = useState(false);

  const addContainer = () => setContainers(prev => [...prev, mkContainer(_id++)]);
  const removeContainer = (id) => setContainers(prev => prev.filter(c => c.id !== id));
  const updateContainer = (id, field, value) =>
    setContainers(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  const applyPreset = (id, preset) =>
    setContainers(prev => prev.map(c => c.id === id ? { ...c, ...preset } : c));

  const calc = useMemo(() => {
    let totalCpuReqM = 0, totalCpuLimM = 0, totalMemReqMi = 0, totalMemLimMi = 0;
    const containerData = containers.map(c => {
      const cpuReqM = parseCpu(c.cpuReq || 0, c.cpuReqU);
      const cpuLimM = parseCpu(c.cpuLim || 0, c.cpuLimU);
      const memReqMi = parseMem(c.memReq || 0, c.memReqU);
      const memLimMi = parseMem(c.memLim || 0, c.memLimU);
      totalCpuReqM += cpuReqM; totalCpuLimM += cpuLimM;
      totalMemReqMi += memReqMi; totalMemLimMi += memLimMi;

      const isGuaranteed = cpuReqM === cpuLimM && memReqMi === memLimMi;
      const isBestEffort = !cpuReqM && !cpuLimM && !memReqMi && !memLimMi;
      const warnings = [];
      if (cpuLimM > 0 && cpuLimM / cpuReqM > 10) warnings.push('CPU limit is >10x request — consider tightening');
      if (memLimMi > 0 && memLimMi / memReqMi > 4) warnings.push('Memory limit is >4x request');
      if (!cpuLimM) warnings.push('No CPU limit set — container can starve neighbors');
      if (!memLimMi) warnings.push('No memory limit — OOMKiller may affect node stability');
      return { ...c, cpuReqM, cpuLimM, memReqMi, memLimMi, isGuaranteed, isBestEffort, warnings };
    });

    // Pod QoS
    const allGuaranteed = containerData.every(c => c.isGuaranteed);
    const allBestEffort = containerData.every(c => c.isBestEffort);
    const qos = allGuaranteed ? 'Guaranteed' : allBestEffort ? 'BestEffort' : 'Burstable';

    // Node capacity
    const nodeCpuM = parseCpu(nodesCpu || 0, 'cores');
    const nodeMemMi = parseMem(nodesMem || 0, 'Gi');
    const podCpuReqM = totalCpuReqM * replicas;
    const podMemReqMi = totalMemReqMi * replicas;
    const cpuFit = nodeCpuM > 0 ? Math.floor(nodeCpuM / totalCpuReqM) : null;
    const memFit = nodeMemMi > 0 ? Math.floor(nodeMemMi / totalMemReqMi) : null;
    const podsFitPerNode = cpuFit !== null && memFit !== null ? Math.min(cpuFit, memFit) : null;
    const nodesNeeded = podsFitPerNode ? Math.ceil(replicas / podsFitPerNode) : null;

    return { containerData, totalCpuReqM, totalCpuLimM, totalMemReqMi, totalMemLimMi, qos, podCpuReqM, podMemReqMi, nodeCpuM, nodeMemMi, podsFitPerNode, nodesNeeded };
  }, [containers, replicas, nodesCpu, nodesMem]);

  // Generate YAML
  const yaml = useMemo(() => {
    const indent = (n, s) => s.split('\n').map(l => ' '.repeat(n) + l).join('\n');
    const containerYaml = containers.map(c => {
      const cpuReqStr = c.cpuReqU === 'cores' ? `${c.cpuReq}` : `${c.cpuReq}m`;
      const cpuLimStr = c.cpuLimU === 'cores' ? `${c.cpuLim}` : `${c.cpuLim}m`;
      const memReqStr = `${c.memReq}${c.memReqU}`;
      const memLimStr = `${c.memLim}${c.memLimU}`;
      return `- name: ${c.name}\n  image: your-image:tag\n  resources:\n    requests:\n      cpu: "${cpuReqStr}"\n      memory: "${memReqStr}"\n    limits:\n      cpu: "${cpuLimStr}"\n      memory: "${memLimStr}"`;
    }).join('\n');
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
${indent(6, containerYaml)}`;
  }, [containers, replicas]);

  const copyYaml = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadYaml = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deployment-resources.yaml'; a.click();
    URL.revokeObjectURL(url);
  };

  const qosInfo = QOS_INFO[calc.qos];

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
          <Layers size={28} />
        </div>
        <div>
          <h1>K8s Resource Calculator</h1>
          <p>Calculate CPU & Memory requests/limits, estimate pod scheduling, and export Kubernetes YAML.</p>
        </div>
      </div>

      <div className="k8s-layout">
        {/* Left — Container configs */}
        <div className="k8s-left">

          {/* Replicas + Node capacity */}
          <div className="k8s-card">
            <div className="k8s-card-title">Cluster Context</div>
            <div className="k8s-context-row">
              <div className="k8s-field">
                <label>Replicas</label>
                <input type="number" className="k8s-input" min="1" value={replicas} onChange={e => setReplicas(Math.max(1, parseInt(e.target.value)||1))} />
              </div>
              <div className="k8s-field">
                <label>Node CPU (cores)</label>
                <input type="number" className="k8s-input" min="0.5" step="0.5" value={nodesCpu} onChange={e => setNodesCpu(e.target.value)} />
              </div>
              <div className="k8s-field">
                <label>Node Memory (Gi)</label>
                <input type="number" className="k8s-input" min="1" value={nodesMem} onChange={e => setNodesMem(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Containers */}
          {containers.map((c, idx) => (
            <div key={c.id} className="k8s-card k8s-container-card">
              <div className="k8s-card-header">
                <div className="k8s-card-title">Container {idx + 1}</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select className="k8s-select-sm" onChange={e => { const p=PRESETS.find(x=>x.label===e.target.value); if(p) applyPreset(c.id, p); e.target.value=''; }} defaultValue="">
                    <option value="" disabled>Preset...</option>
                    {PRESETS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                  {containers.length > 1 && (
                    <button className="btn btn-small btn-danger" onClick={() => removeContainer(c.id)}><Trash2 size={13}/></button>
                  )}
                </div>
              </div>

              <div className="k8s-name-row">
                <label>Name</label>
                <input className="k8s-input-wide" value={c.name} onChange={e => updateContainer(c.id, 'name', e.target.value)} spellCheck="false" />
              </div>

              <div className="k8s-resource-grid">
                {/* CPU */}
                <div className="k8s-resource-col">
                  <div className="k8s-resource-label cpu-label">⚙️ CPU</div>
                  <div className="k8s-resource-row">
                    <span className="k8s-rtype">Request</span>
                    <input type="number" className="k8s-input-sm" min="0" step="any" value={c.cpuReq} onChange={e => updateContainer(c.id, 'cpuReq', e.target.value)} />
                    <select className="k8s-unit" value={c.cpuReqU} onChange={e => updateContainer(c.id, 'cpuReqU', e.target.value)}>
                      <option value="m">m</option><option value="cores">cores</option>
                    </select>
                  </div>
                  <div className="k8s-resource-row">
                    <span className="k8s-rtype">Limit</span>
                    <input type="number" className="k8s-input-sm" min="0" step="any" value={c.cpuLim} onChange={e => updateContainer(c.id, 'cpuLim', e.target.value)} />
                    <select className="k8s-unit" value={c.cpuLimU} onChange={e => updateContainer(c.id, 'cpuLimU', e.target.value)}>
                      <option value="m">m</option><option value="cores">cores</option>
                    </select>
                  </div>
                </div>

                {/* Memory */}
                <div className="k8s-resource-col">
                  <div className="k8s-resource-label mem-label">🧠 Memory</div>
                  <div className="k8s-resource-row">
                    <span className="k8s-rtype">Request</span>
                    <input type="number" className="k8s-input-sm" min="0" step="any" value={c.memReq} onChange={e => updateContainer(c.id, 'memReq', e.target.value)} />
                    <select className="k8s-unit" value={c.memReqU} onChange={e => updateContainer(c.id, 'memReqU', e.target.value)}>
                      <option value="Mi">Mi</option><option value="Gi">Gi</option>
                    </select>
                  </div>
                  <div className="k8s-resource-row">
                    <span className="k8s-rtype">Limit</span>
                    <input type="number" className="k8s-input-sm" min="0" step="any" value={c.memLim} onChange={e => updateContainer(c.id, 'memLim', e.target.value)} />
                    <select className="k8s-unit" value={c.memLimU} onChange={e => updateContainer(c.id, 'memLimU', e.target.value)}>
                      <option value="Mi">Mi</option><option value="Gi">Gi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Per-container warnings */}
              {calc.containerData[idx]?.warnings.map((w, wi) => (
                <div key={wi} className="k8s-inline-warn"><AlertTriangle size={12}/> {w}</div>
              ))}
            </div>
          ))}

          <button className="btn btn-primary k8s-add-btn" onClick={addContainer}>
            <Plus size={16}/> Add Container
          </button>
        </div>

        {/* Right — Results */}
        <div className="k8s-right">

          {/* QoS Class */}
          <div className="k8s-card k8s-qos-card" style={{borderLeft:`3px solid ${qosInfo.color}`}}>
            <div className="k8s-qos-row">
              <div>
                <div className="k8s-label-sm">Pod QoS Class</div>
                <div className="k8s-qos-badge" style={{color:qosInfo.color}}>{calc.qos}</div>
              </div>
              <div className="k8s-qos-desc">{qosInfo.desc}</div>
            </div>
          </div>

          {/* Totals per pod */}
          <div className="k8s-card">
            <div className="k8s-card-title">Per Pod (1 replica)</div>
            <div className="k8s-totals-grid">
              {[
                { label:'CPU Request', val: fmtCpu(calc.totalCpuReqM), icon:'⚙️' },
                { label:'CPU Limit',   val: fmtCpu(calc.totalCpuLimM), icon:'⚙️' },
                { label:'Mem Request', val: fmtMem(calc.totalMemReqMi), icon:'🧠' },
                { label:'Mem Limit',   val: fmtMem(calc.totalMemLimMi), icon:'🧠' },
              ].map(({label,val,icon})=>(
                <div key={label} className="k8s-total-item">
                  <div className="k8s-total-label">{icon} {label}</div>
                  <div className="k8s-total-val">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total cluster */}
          <div className="k8s-card">
            <div className="k8s-card-title">Total Cluster ({replicas} replica{replicas!==1?'s':''})</div>
            <div className="k8s-totals-grid">
              {[
                { label:'CPU Requested', val: fmtCpu(calc.podCpuReqM) },
                { label:'Mem Requested', val: fmtMem(calc.podMemReqMi) },
              ].map(({label,val})=>(
                <div key={label} className="k8s-total-item">
                  <div className="k8s-total-label">{label}</div>
                  <div className="k8s-total-val">{val}</div>
                </div>
              ))}
            </div>

            {/* Node fit */}
            {calc.podsFitPerNode !== null && (
              <div className="k8s-node-fit">
                <div className="k8s-fit-item">
                  <Info size={13} color="var(--accent)"/>
                  <span><strong>{calc.podsFitPerNode}</strong> pod{calc.podsFitPerNode!==1?'s':''} fit per node ({nodesCpu} core / {nodesMem} Gi)</span>
                </div>
                <div className="k8s-fit-item">
                  <CheckCircle2 size={13} color="#10b981"/>
                  <span>Minimum <strong>{calc.nodesNeeded}</strong> node{calc.nodesNeeded!==1?'s':''} needed for {replicas} replica{replicas!==1?'s':''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Node utilization bars */}
          {calc.nodeCpuM > 0 && calc.nodeMemMi > 0 && (
            <div className="k8s-card">
              <div className="k8s-card-title">Node Utilization (1 pod / node)</div>
              {[
                { label:'CPU', used: calc.totalCpuReqM, total: calc.nodeCpuM, fmt: fmtCpu, color:'#6366f1' },
                { label:'Memory', used: calc.totalMemReqMi, total: calc.nodeMemMi, fmt: fmtMem, color:'#10b981' },
              ].map(({label,used,total,fmt,color})=>{
                const pct = Math.min(100, Math.round(used/total*100));
                return (
                  <div key={label} className="k8s-bar-row">
                    <div className="k8s-bar-label">
                      <span>{label}</span>
                      <span>{fmt(used)} / {fmt(total)} ({pct}%)</span>
                    </div>
                    <div className="k8s-bar-track">
                      <div className="k8s-bar-fill" style={{width:`${pct}%`, background:pct>80?'#ef4444':pct>60?'#f59e0b':color}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* YAML */}
          <div className="k8s-card k8s-yaml-card">
            <div className="k8s-card-header">
              <div className="k8s-card-title">Generated YAML</div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-small" onClick={copyYaml}><Copy size={13}/> {copied?'✓ Copied!':'Copy'}</button>
                <button className="btn btn-small" onClick={downloadYaml}><Download size={13}/> Download</button>
              </div>
            </div>
            <pre className="k8s-yaml">{yaml}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default K8sResourceCalculator;
