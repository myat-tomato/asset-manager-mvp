import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';
import { clearAuthUser, getAuthUser } from './services/authService';

import DeviceListPage from './pages/DeviceListPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import DeviceQrPage from './pages/DeviceQrPage';
import QrGeneratePage from './pages/QrGeneratePage';
import QrScanPage from './pages/QrScanPage';
import LoanPage from './pages/LoanPage';
import CompletePage from './pages/CompletePage';
import DeviceHistoryPage from './pages/DeviceHistoryPage';

function QrRedirectHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const deviceNo = searchParams.get('deviceNo');

    if (deviceNo) {
      navigate(`/device/${encodeURIComponent(deviceNo)}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

function MenuPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  function handleLogout() {
    clearAuthUser();

    const google = window.google;

    if (google) {
      google.accounts.id.disableAutoSelect();
    }

    navigate('/login', { replace: true });
  }

  return (
    <main className="menu-page">
      <section className="menu-content">
        <div className="menu-badge">HAM</div>

        <p className="menu-subtitle">
          DEVICE貸出・返却管理システム
        </p>

        {user && (
          <p className="menu-user">
            ログインユーザー
            <br />
            <strong>{user.email}</strong>
          </p>
        )}

        <div className="menu-actions">
          <button onClick={() => navigate('/devices')}>
            DEVICE一覧
          </button>

          <button onClick={() => navigate('/qr')}>
            QRコード生成
          </button>

          <button onClick={() => navigate('/scan')}>
            QRコード読取
          </button>
        </div>

        <button className="menu-logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QrRedirectHandler />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <AuthGuard>
              <MenuPage />
            </AuthGuard>
          }
        />

        <Route
          path="/devices"
          element={
            <AuthGuard>
              <DeviceListPage />
            </AuthGuard>
          }
        />

        <Route
          path="/device/:deviceNo"
          element={
            <AuthGuard>
              <DeviceDetailPage />
            </AuthGuard>
          }
        />

        <Route
          path="/qr"
          element={
            <AuthGuard>
              <QrGeneratePage />
            </AuthGuard>
          }
        />

        <Route
          path="/scan"
          element={
            <AuthGuard>
              <QrScanPage />
            </AuthGuard>
          }
        />

        <Route
          path="/loan"
          element={
            <AuthGuard>
              <LoanPage />
            </AuthGuard>
          }
        />

        <Route
          path="/complete"
          element={
            <AuthGuard>
              <CompletePage />
            </AuthGuard>
          }
        />

        <Route
          path="/device/:deviceNo/history"
          element={
            <AuthGuard>
              <DeviceHistoryPage />
            </AuthGuard>
          }
        />

        <Route
          path="/device/:deviceNo/qr"
          element={
            <AuthGuard>
              <DeviceQrPage />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;