import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HelmConverter from './pages/HelmConverter';
import KubeconfigMerger from './pages/KubeconfigMerger';
import JwtDecoder from './pages/JwtDecoder';
import YamlFormatter from './pages/YamlFormatter';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="helm-converter" element={<HelmConverter />} />
          <Route path="kubeconfig-merger" element={<KubeconfigMerger />} />
          <Route path="jwt-decoder" element={<JwtDecoder />} />
          <Route path="yaml-formatter" element={<YamlFormatter />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
