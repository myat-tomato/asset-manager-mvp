import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

type CompletePageState = {
  title?: string;
  message?: string;
  deviceNo?: string;
  showQr?: boolean;
};

function buildDeviceQrUrl(deviceNo: string) {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
  return `${baseUrl}/?deviceNo=${encodeURIComponent(deviceNo)}`;
}

function CompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const state = location.state as CompletePageState | null;

  const title = state?.title || '更新完了';
  const message = state?.message || '処理が完了しました。';
  const deviceNo = state?.deviceNo;
  const showQr = Boolean(state?.showQr && deviceNo);

  const qrUrl = deviceNo ? buildDeviceQrUrl(deviceNo) : '';

  function handleDownloadQr() {
    if (!deviceNo) {
      return;
    }

    const canvas = qrContainerRef.current?.querySelector('canvas');

    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    link.href = url;
    link.download = `DEVICE-${deviceNo}-QR.png`;
    link.click();
  }

  function handlePrintQr() {
    window.print();
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>{title}</h1>

      <p>{message}</p>

      {deviceNo && (
        <p>
          デバイス番号: <strong>{deviceNo}</strong>
        </p>
      )}

      {showQr && (
        <div
          style={{
            marginTop: '24px',
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            maxWidth: '360px',
          }}
        >
          <h2>QRコード</h2>
          <p>
            このQRコードを読み取ると、対象デバイスの詳細画面へアクセスできます。
          </p>

          <div ref={qrContainerRef}>
            <QRCodeCanvas
              value={qrUrl}
              size={240}
              level="M"
              includeMargin
            />
          </div>

          <p
            style={{
              marginTop: '12px',
              wordBreak: 'break-all',
              fontSize: '12px',
            }}
          >
            {qrUrl}
          </p>

          <div style={{ marginTop: '16px' }}>
            <button type="button" onClick={handleDownloadQr}>
              PNG保存
            </button>

            <button
              type="button"
              onClick={handlePrintQr}
              style={{ marginLeft: '8px' }}
            >
              印刷 / PDF保存
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        {deviceNo && (
          <>
            <button
              type="button"
              onClick={() =>
                navigate(`/device/${encodeURIComponent(deviceNo)}`)
              }
            >
              デバイス詳細へ
            </button>

            {!showQr && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/device/${encodeURIComponent(deviceNo)}/qr`)
                }
                style={{ marginLeft: '8px' }}
              >
                QR表示画面へ
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/devices')}
          style={{ marginLeft: deviceNo ? '8px' : 0 }}
        >
          デバイス一覧へ
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ marginLeft: '8px' }}
        >
          メニューへ
        </button>
      </div>
    </div>
  );
}

export default CompletePage;