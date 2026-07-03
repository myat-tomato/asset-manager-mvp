import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeviceList, type Device } from '../services/deviceService';

type DisplayField =
  | 'deviceName'
  | 'status'
  | 'classification'
  | 'currentUser'
  | 'location';

type ActionValue = '' | 'detail' | 'qr' | 'history';

const displayFieldOptions: { value: DisplayField; label: string }[] = [
  { value: 'deviceName', label: 'DEVICE名' },
  { value: 'status', label: '状況' },
  { value: 'classification', label: '分類' },
  { value: 'currentUser', label: '現在使用者' },
  { value: 'location', label: '場所' },
];

function DeviceListPage() {
  const navigate = useNavigate();

  const [allDeviceList, setAllDeviceList] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [displayField, setDisplayField] = useState<DisplayField>('deviceName');

  function loadDeviceList() {
    setError('');

    if (allDeviceList.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

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

  function getDisplayValue(device: Device) {
    return String(device[displayField] ?? '-');
  }

  function handleActionChange(
    deviceNo: string,
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const action = event.target.value as ActionValue;

    if (!action) return;

    if (action === 'detail') {
      navigate(`/device/${encodeURIComponent(deviceNo)}`);
      return;
    }

    if (action === 'qr') {
      navigate(`/device/${encodeURIComponent(deviceNo)}/qr`);
      return;
    }

    if (action === 'history') {
      navigate(`/device/${encodeURIComponent(deviceNo)}/history`);
    }
  }

  if (loading) {
    return (
      <main className="device-list-page">
        <p className="loading-message">読み込み中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="device-list-page">
        <p className="error-message" role="alert">
          エラー: {error}
        </p>

        <button className="button-secondary" onClick={() => navigate('/')}>
          メニューへ戻る
        </button>
      </main>
    );
  }

  return (
    <main className="device-list-page">
      <section className="device-list-content">
        <header className="device-list-header">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate('/')}
          >
            ← メニュー
          </button>

          <h1 className="device-list-title">DEVICE一覧</h1>

          <p className="device-list-count">
            表示件数: {filteredDeviceList.length} / {allDeviceList.length}
          </p>
        </header>

        <div className="device-list-controls">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="番号 / DEVICE名 / 使用者で検索"
            className="device-search-input"
          />

          <select
            value={displayField}
            onChange={(e) => setDisplayField(e.target.value as DisplayField)}
            className="device-field-select"
            aria-label="表示項目"
          >
            {displayFieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                表示: {option.label}
              </option>
            ))}
          </select>

          <div className="device-control-buttons">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setKeyword('')}
            >
              クリア
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={loadDeviceList}
              disabled={refreshing}
            >
              {refreshing ? '更新中...' : '更新'}
            </button>
          </div>
        </div>

        <div className="device-table-wrapper">
          <table className="device-table">
            <thead>
              <tr>
                <th>番号</th>
                <th>
                  {
                    displayFieldOptions.find(
                      (option) => option.value === displayField,
                    )?.label
                  }
                </th>
                <th>操作</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeviceList.map((device) => {
                const deviceNo = String(device.deviceNo).trim();

                return (
                  <tr key={deviceNo}>
                    <td className="device-no-cell">{device.deviceNo}</td>

                    <td className="device-main-cell">
                      {getDisplayValue(device)}
                    </td>

                    <td className="device-action-cell">
                      <select
                        defaultValue=""
                        className="device-action-select"
                        aria-label={`${deviceNo}の操作`}
                        onChange={(event) => handleActionChange(deviceNo, event)}
                      >
                        <option value="" disabled>
                          選択
                        </option>
                        <option value="detail">詳細</option>
                        <option value="qr">QR表示</option>
                        <option value="history">履歴</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDeviceList.length === 0 && (
          <p className="device-empty-message">
            対象DEVICEが見つかりません。
          </p>
        )}
      </section>
    </main>
  );
}

export default DeviceListPage;