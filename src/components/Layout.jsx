import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Anchor, Hexagon, GitMerge, KeySquare, FileCode2, ShieldCheck, RefreshCw, Clock, Globe, Lock, Layers, Radio, BookOpen } from 'lucide-react';
import '../index.css';

const Layout = () => {
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

          <div className="nav-group-label">CONTAINERS</div>
          <NavLink to="/helm-converter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Anchor size={20} />
            <span>Helm Image Converter</span>
          </NavLink>

          <div className="nav-group-label">KUBERNETES</div>
          <NavLink to="/kubeconfig-merger" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <GitMerge size={20} />
            <span>Kubeconfig Merger</span>
          </NavLink>
          <NavLink to="/yaml-formatter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileCode2 size={20} />
            <span>YAML Formatter</span>
          </NavLink>
          <NavLink to="/cron-builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock size={20} />
            <span>Cron Builder</span>
          </NavLink>

          <div className="nav-group-label">SECURITY</div>
          <NavLink to="/jwt-decoder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <KeySquare size={20} />
            <span>JWT Decoder</span>
          </NavLink>
          <NavLink to="/base64" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={20} />
            <span>Base64 Encode/Decode</span>
          </NavLink>

          <div className="nav-group-label">UTILITIES</div>
          <NavLink to="/json-yaml" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <RefreshCw size={20} />
            <span>JSON ↔ YAML</span>
          </NavLink>

          <div className="nav-group-label">DOMAIN</div>
          <NavLink to="/dns-lookup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Globe size={20} />
            <span>DNS Lookup</span>
          </NavLink>
          <NavLink to="/ssl-checker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Lock size={20} />
            <span>SSL Checker</span>
          </NavLink>
          <NavLink to="/http-headers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Layers size={20} />
            <span>HTTP Headers</span>
          </NavLink>
          <NavLink to="/whois" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>WHOIS Lookup</span>
          </NavLink>
        </nav>
      </aside>
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
