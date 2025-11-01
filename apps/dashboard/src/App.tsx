import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';

function inOffice(): boolean {
  return typeof (window as any).Office !== 'undefined' && !!(window as any).Office?.context?.host;
}

export default function App() {
  if (inOffice()) {
    // Keep your current taskpane/dev card here
    return (
      <div style={{ maxWidth: 560, margin: '64px auto', fontFamily: 'system-ui' }}>
        <h2>MHP Brand Automation</h2>
        <p>Development environment taskpane loaded successfully.</p>
        {/* …existing test UI… */}
      </div>
    );
  }

  // Standalone dashboard (browser mode)
  return (
    <BrowserRouter basename="/dashboard">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/templates"
          element={<div style={{ padding: 24 }}>Templates (coming soon)</div>}
        />
        <Route
          path="/compliance"
          element={<div style={{ padding: 24 }}>Compliance (coming soon)</div>}
        />
        <Route
          path="/analytics"
          element={<div style={{ padding: 24 }}>Analytics (coming soon)</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}
