import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeviceListPage } from './pages/DeviceListPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { DeviceComparePage } from './pages/DeviceComparePage';
import { CollectorListPage } from './pages/CollectorListPage';
import { CollectorDetailPage } from './pages/CollectorDetailPage';
import { KeyTypeListPage } from './pages/KeyTypeListPage';
import { TagListPage } from './pages/TagListPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeviceListPage />} />
        <Route path="/devices/compare" element={<DeviceComparePage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
        <Route path="/collectors" element={<CollectorListPage />} />
        <Route path="/collectors/:id" element={<CollectorDetailPage />} />
        <Route path="/key-types" element={<KeyTypeListPage />} />
        <Route path="/tags" element={<TagListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
