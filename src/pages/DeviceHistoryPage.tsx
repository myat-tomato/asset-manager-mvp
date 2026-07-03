import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getDeviceHistory, type DeviceHistory } from '../services/historyService';
import DeviceHistoryTable from '../components/DeviceHistoryTable';

function DeviceHistoryPage() {
  const { deviceNo } = useParams();
  const navigate = useNavigate();

  const [historyList, setHistoryList] = useState<DeviceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deviceNo) {
      setError('DEVICE番号が指定されていません。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    getDeviceHistory(deviceNo)
      .then(setHistoryList)
      .catch((err) => {
        setError(err instanceof Error ? err.message : '履歴の取得に失敗しました。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deviceNo]);

  if (loading) {
    return (
      <main className="device-history-page">
        <p className="loading-message">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="device-history-page">
      <section className="device-history-content">
        <header className="device-history-header">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate('/devices')}
          >
            ← 一覧
          </button>

          <p className="device-history-no">
            DEVICE番号：<strong>{deviceNo || '-'}</strong>
          </p>

          <h1 className="device-history-title">更新履歴</h1>
        </header>

        {error && (
          <p className="error-message" role="alert">
            エラー: {error}
          </p>
        )}

        {!error && <DeviceHistoryTable historyList={historyList} />}

        <div className="device-history-actions">
          {deviceNo && (
            <button
              type="button"
              onClick={() => navigate(`/device/${encodeURIComponent(deviceNo)}`)}
            >
              DEVICE詳細へ
            </button>
          )}

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate('/devices')}
          >
            DEVICE一覧へ戻る
          </button>
        </div>
      </section>
    </main>
  );
}

export default DeviceHistoryPage;