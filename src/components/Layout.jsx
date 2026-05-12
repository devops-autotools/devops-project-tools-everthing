import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Anchor, Hexagon, GitMerge, KeySquare, FileCode2 } from 'lucide-react';
import '../index.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Hexagon className="logo-icon" size={28} style={{ color: 'var(--accent)' }} />
          <h2>DevOps AutoTools</h2>
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
          <div className="nav-group-label">SECURITY</div>
          <NavLink to="/jwt-decoder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <KeySquare size={20} />
            <span>JWT Decoder</span>
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
