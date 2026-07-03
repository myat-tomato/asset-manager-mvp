import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceList, type Device } from '../services/deviceService';

function DeviceListPage() {
  const navigate = useNavigate();

  const [allDeviceList, setAllDeviceList] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  function loadDeviceList() {
    setError('');

    if (allDeviceList.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    // Get all data from GAS once
    getDeviceList('')
      .then(setAllDeviceList)
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    loadDeviceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDeviceList = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return allDeviceList;

    return allDeviceList.filter((device) => {
      const targetText = [
        device.deviceNo,
        device.deviceName,
        device.status,
        device.classification,
        device.currentUser,
        device.location,
      ]
        .map((value) => String(value ?? '').toLowerCase())
        .join(' ');

      return targetText.includes(text);
    });
  }, [allDeviceList, keyword]);

  if (loading) return <div style={{ padding: '24px' }}>読み込み中...</div>;

  if (error) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        エラー: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>DEVICE一覧</h1>

      <div style={{ marginBottom: '16px' }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="番号 / DEVICE名 / 使用者で検索"
          style={{ padding: '8px', width: '260px', marginRight: '8px' }}
        />

        <button onClick={() => setKeyword('')}>
          クリア
        </button>

        <button onClick={loadDeviceList} style={{ marginLeft: '8px' }}>
          {refreshing ? '更新中...' : '更新'}
        </button>

        <button onClick={() => navigate('/')} style={{ marginLeft: '8px' }}>
          メニューへ戻る
        </button>
      </div>

      <p>
        表示件数: {filteredDeviceList.length} / {allDeviceList.length}
      </p>

      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>番号</th>
            <th>DEVICE名</th>
            <th>状況</th>
            <th>分類</th>
            <th>現在使用者</th>
            <th>場所</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {filteredDeviceList.map((device) => (
            <tr key={String(device.deviceNo)}>
              <td>{device.deviceNo}</td>
              <td>{device.deviceName}</td>
              <td>{device.status}</td>
              <td>{device.classification}</td>
              <td>{device.currentUser}</td>
              <td>{device.location}</td>
              <td>
                <button onClick={() => navigate(`/device/${device.deviceNo}`)}>
                  詳細
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const deviceNo = String(device.deviceNo).trim();
                    navigate(`/device/${encodeURIComponent(deviceNo)}/qr`);
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  QR
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/device/${encodeURIComponent(String(device.deviceNo))}/history`)}
                  style={{ marginLeft: '8px' }}
                >
                  履歴
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredDeviceList.length === 0 && <p>対象DEVICEが見つかりません。</p>}
    </div>
  );
}

export default DeviceListPage;