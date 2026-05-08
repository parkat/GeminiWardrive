/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Explorer } from './pages/Explorer';
import { Security } from './pages/Security';

export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/security" element={<Security />} />
          <Route path="/database" element={<Dashboard />} /> {/* Placeholder for History */}
          <Route path="/settings" element={<Dashboard />} /> {/* Placeholder for Settings */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Shell>
    </Router>
  );
}

