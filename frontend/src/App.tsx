import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeviceListPage } from './pages/DeviceListPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';

/**
 * 应用路由
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeviceListPage />} />
        <Route path="/devices/:id" element={<DeviceDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
