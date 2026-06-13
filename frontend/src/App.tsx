import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeviceListPage } from './pages/DeviceListPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { CollectorListPage } from './pages/CollectorListPage';
import { CollectorDetailPage } from './pages/CollectorDetailPage';
import { KeyTypeListPage } from './pages/KeyTypeListPage';

/**
 * 应用路由
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeviceListPage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/collectors" element={<CollectorListPage />} />
        <Route path="/collectors/:id" element={<CollectorDetailPage />} />
        <Route path="/key-types" element={<KeyTypeListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
