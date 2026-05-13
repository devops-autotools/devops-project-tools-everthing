import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Anchor, Hexagon, GitMerge, KeySquare, 
  FileCode2, ShieldCheck, RefreshCw, Clock, Globe, 
  Lock, Layers, BookOpen, FileText, ChevronDown, ChevronRight 
} from 'lucide-react';
import '../index.css';

const Layout = () => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({
    containers: true,
    kubernetes: false,
    security: false,
    utilities: false,
    domain: false
  });

  // Auto-open group based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('helm') || path.includes('dockerfile')) {
      setOpenGroups(prev => ({ ...prev, containers: true }));
    } else if (path.includes('kube') || path.includes('yaml') || path.includes('cron') || path.includes('k8s')) {
      setOpenGroups(prev => ({ ...prev, kubernetes: true }));
    } else if (path.includes('jwt') || path.includes('ssh') || path.includes('base64')) {
      setOpenGroups(prev => ({ ...prev, security: true }));
    } else if (path.includes('json') || path.includes('regex')) {
      setOpenGroups(prev => ({ ...prev, utilities: true }));
    } else if (path.includes('dns') || path.includes('ssl') || path.includes('http') || path.includes('whois')) {
      setOpenGroups(prev => ({ ...prev, domain: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const GroupHeader = ({ id, label, icon: Icon }) => (
    <div 
      className={`nav-group-header ${openGroups[id] ? 'expanded' : ''}`} 
      onClick={() => toggleGroup(id)}
    >
      <div className="group-label-left">
        <span className="group-dot"></span>
        <span className="nav-group-label-text">{label}</span>
      </div>
      {openGroups[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </div>
  );

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Hexagon className="logo-icon" size={28} style={{ color: 'var(--accent)' }} />
          <h2>Tools-Everthing</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* CONTAINERS */}
          <GroupHeader id="containers" label="CONTAINERS" />
          {openGroups.containers && (
            <div className="nav-group-items">
              <NavLink to="/helm-converter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Anchor size={18} />
                <span>Helm Converter</span>
              </NavLink>
              <NavLink to="/dockerfile-linter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Dockerfile Linter</span>
              </NavLink>
            </div>
          )}

          {/* KUBERNETES */}
          <GroupHeader id="kubernetes" label="KUBERNETES" />
          {openGroups.kubernetes && (
            <div className="nav-group-items">
              <NavLink to="/kubeconfig-merger" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <GitMerge size={18} />
                <span>Kubeconfig Merger</span>
              </NavLink>
              <NavLink to="/yaml-formatter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileCode2 size={18} />
                <span>YAML Formatter</span>
              </NavLink>
              <NavLink to="/cron-builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Clock size={18} />
                <span>Cron Builder</span>
              </NavLink>
              <NavLink to="/k8s-calculator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Layers size={18} />
                <span>Resource Calc</span>
              </NavLink>
            </div>
          )}

          {/* SECURITY */}
          <GroupHeader id="security" label="SECURITY" />
          {openGroups.security && (
            <div className="nav-group-items">
              <NavLink to="/jwt-decoder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <KeySquare size={18} />
                <span>JWT Decoder</span>
              </NavLink>
              <NavLink to="/ssh-generator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <KeySquare size={18} />
                <span>SSH Key Gen</span>
              </NavLink>
              <NavLink to="/base64" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={18} />
                <span>Base64 Tool</span>
              </NavLink>
            </div>
          )}

          {/* UTILITIES */}
          <GroupHeader id="utilities" label="UTILITIES" />
          {openGroups.utilities && (
            <div className="nav-group-items">
              <NavLink to="/json-yaml" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <RefreshCw size={18} />
                <span>JSON ↔ YAML</span>
              </NavLink>
              <NavLink to="/regex-tester" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Layers size={18} /> {/* Using Layers as placeholder for Regex */}
                <span>Regex Tester</span>
              </NavLink>
            </div>
          )}

          {/* DOMAIN */}
          <GroupHeader id="domain" label="DOMAIN" />
          {openGroups.domain && (
            <div className="nav-group-items">
              <NavLink to="/dns-lookup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Globe size={18} />
                <span>DNS Lookup</span>
              </NavLink>
              <NavLink to="/ssl-checker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Lock size={18} />
                <span>SSL Checker</span>
              </NavLink>
              <NavLink to="/http-headers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Layers size={18} />
                <span>HTTP Headers</span>
              </NavLink>
              <NavLink to="/whois" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BookOpen size={18} />
                <span>WHOIS Lookup</span>
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
