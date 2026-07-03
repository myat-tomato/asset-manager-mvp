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
        return <div style={{ padding: '24px' }}>読み込み中...</div>;
    }

    return (
        <div style={{ padding: '24px' }}>
            <h1>DEVICE更新履歴</h1>

            <p>
                DEVICE番号: <strong>{deviceNo}</strong>
            </p>

            {error && (
                <p style={{ color: 'red' }}>
                    エラー: {error}
                </p>
            )}

            {!error && <DeviceHistoryTable historyList={historyList} />}

            <div style={{ marginTop: '16px' }}>
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
                    onClick={() => navigate('/devices')}
                    style={{ marginLeft: '8px' }}
                >
                    DEVICE一覧へ戻る
                </button>
            </div>
        </div>
    );
}

export default DeviceHistoryPage;