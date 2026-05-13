import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HelmConverter from './pages/HelmConverter';
import KubeconfigMerger from './pages/KubeconfigMerger';
import JwtDecoder from './pages/JwtDecoder';
import YamlFormatter from './pages/YamlFormatter';
import Base64Tool from './pages/Base64Tool';
import JsonYamlConverter from './pages/JsonYamlConverter';
import CronBuilder from './pages/CronBuilder';
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
          <Route path="base64" element={<Base64Tool />} />
          <Route path="json-yaml" element={<JsonYamlConverter />} />
          <Route path="cron-builder" element={<CronBuilder />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
