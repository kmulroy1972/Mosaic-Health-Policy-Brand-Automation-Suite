import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

import AnalyticsPage from './pages/Analytics';
import CompliancePage from './pages/Compliance';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/Templates';

function inOffice(): boolean {
  return typeof (window as any).Office !== 'undefined' && !!(window as any).Office?.context?.host;
}

function Nav() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link
      to={to}
      style={{
        marginRight: 16,
        textDecoration: pathname === to ? 'underline' : 'none'
      }}
    >
      {label}
    </Link>
  );
  return (
    <div style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
      {link('/dashboard', 'Dashboard')}
      {link('/templates', 'Templates')}
      {link('/compliance', 'Compliance')}
      {link('/analytics', 'Analytics')}
    </div>
  );
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
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
