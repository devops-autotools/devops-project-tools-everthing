import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, KeySquare, FileCode2, GitMerge, Settings } from 'lucide-react';

const tools = [
  {
    id: 'helm-converter',
    name: 'Helm Image Converter',
    description: 'Auto-convert public container images in values.yaml to a private registry.',
    icon: <Anchor size={24} />,
    path: '/helm-converter',
    status: 'active'
  },
  {
    id: 'kubeconfig-merger',
    name: 'Kubeconfig Merger',
    description: 'Safely merge multiple kubeconfig files into a single context.',
    icon: <GitMerge size={24} />,
    path: '/kubeconfig-merger',
    status: 'active'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens locally without internet.',
    icon: <KeySquare size={24} />,
    path: '/jwt-decoder',
    status: 'active'
  },
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    description: 'Format, validate and lint complex Kubernetes YAML files.',
    icon: <FileCode2 size={24} />,
    path: '/yaml-formatter',
    status: 'active'
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
