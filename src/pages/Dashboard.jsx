import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, KeySquare, FileCode2, GitMerge, ShieldCheck, RefreshCw, Clock } from 'lucide-react';

const tools = [
  {
    id: 'helm-converter',
    name: 'Helm Image Converter',
    description: 'Auto-convert public container images in values.yaml to a private registry.',
    icon: <Anchor size={24} />,
    path: '/helm-converter',
    status: 'active',
    group: 'Containers'
  },
  {
    id: 'kubeconfig-merger',
    name: 'Kubeconfig Merger',
    description: 'Safely merge multiple kubeconfig files into a single context.',
    icon: <GitMerge size={24} />,
    path: '/kubeconfig-merger',
    status: 'active',
    group: 'Kubernetes'
  },
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter & K8s Validator',
    description: 'Format, validate and lint complex Kubernetes YAML files with schema checks.',
    icon: <FileCode2 size={24} />,
    path: '/yaml-formatter',
    status: 'active',
    group: 'Kubernetes'
  },
  {
    id: 'cron-builder',
    name: 'Cron Expression Builder',
    description: 'Build and validate cron expressions with a live preview of next scheduled runs.',
    icon: <Clock size={24} />,
    path: '/cron-builder',
    status: 'active',
    group: 'Kubernetes'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens locally without internet.',
    icon: <KeySquare size={24} />,
    path: '/jwt-decoder',
    status: 'active',
    group: 'Security'
  },
  {
    id: 'base64',
    name: 'Base64 Encode / Decode',
    description: 'Encode text to Base64 or decode Base64 strings. Works offline, great for K8s Secrets.',
    icon: <ShieldCheck size={24} />,
    path: '/base64',
    status: 'active',
    group: 'Security'
  },
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML Converter',
    description: 'Instantly convert between JSON and YAML formats with real-time preview.',
    icon: <RefreshCw size={24} />,
    path: '/json-yaml',
    status: 'active',
    group: 'Utilities'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, DevOps Engineer</h1>
        <p>Select a tool below to accelerate your deployment workflow.</p>
      </header>

      <div className="tools-grid">
        {tools.map(tool => (
          <div 
            key={tool.id} 
            className={`tool-card ${tool.status}`}
            onClick={() => tool.status === 'active' && navigate(tool.path)}
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <div className="tool-card-content">
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>
            {tool.status === 'coming-soon' && (
              <span className="badge-coming-soon">Coming Soon</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
