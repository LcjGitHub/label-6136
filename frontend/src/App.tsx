import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DeviceListPage } from './pages/DeviceListPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { DeviceComparePage } from './pages/DeviceComparePage';
import { CollectorListPage } from './pages/CollectorListPage';
import { CollectorDetailPage } from './pages/CollectorDetailPage';
import { KeyTypeListPage } from './pages/KeyTypeListPage';
import { EraListPage } from './pages/EraListPage';
import { TagListPage } from './pages/TagListPage';
import { CollectionRecordListPage } from './pages/CollectionRecordListPage';
import { CollectionRecordDetailPage } from './pages/CollectionRecordDetailPage';
import { OperationLogListPage } from './pages/OperationLogListPage';
import { FavoriteListPage } from './pages/FavoriteListPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DeviceListPage />} />
          <Route path="/favorites" element={<FavoriteListPage />} />
          <Route path="/devices/compare" element={<DeviceComparePage />} />
          <Route path="/devices/:id" element={<DeviceDetailPage />} />
          <Route path="/collectors" element={<CollectorListPage />} />
          <Route path="/collectors/:id" element={<CollectorDetailPage />} />
          <Route path="/collection-records" element={<CollectionRecordListPage />} />
          <Route path="/collection-records/:id" element={<CollectionRecordDetailPage />} />
          <Route path="/key-types" element={<KeyTypeListPage />} />
          <Route path="/eras" element={<EraListPage />} />
          <Route path="/tags" element={<TagListPage />} />
          <Route path="/operation-logs" element={<OperationLogListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
