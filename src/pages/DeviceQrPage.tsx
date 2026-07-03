import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate, useParams } from 'react-router-dom';

function getAppBaseUrl() {
  const appUrl = import.meta.env.VITE_APP_BASE_URL;

  if (appUrl) {
    return appUrl.replace(/\/$/, '');
  }

  return window.location.origin;
}

function getDeviceQrUrl(deviceNo: string) {
  const baseUrl = getAppBaseUrl();

  // QR should open the app root with ?deviceNo=
  // This is safer than opening /device/:deviceNo directly.
  return `${baseUrl}?deviceNo=${encodeURIComponent(deviceNo)}`;
}

function DeviceQrPage() {
  const navigate = useNavigate();
  const { deviceNo } = useParams();

  if (!deviceNo) {
    return (
      <main className="device-qr-page">
        <p className="error-message">DEVICE番号が見つかりません。</p>

        <button
          type="button"
          className="button-secondary"
          onClick={() => navigate('/devices')}
        >
          DEVICE一覧へ戻る
        </button>
      </main>
    );
  }

  const qrUrl = getDeviceQrUrl(deviceNo);

  function downloadQrCode() {
    const canvas = document.getElementById('device-qr-code') as HTMLCanvasElement | null;

    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `DEVICE-${deviceNo}-QR.png`;
    link.click();
  }

  return (
    <main className="device-qr-page">
      <section className="device-qr-content">
        <header className="device-qr-header no-print">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate(`/device/${encodeURIComponent(deviceNo)}`)}
          >
            ← 詳細へ戻る
          </button>

          <h1 className="device-qr-title">QRコード</h1>
        </header>

        <section>
          <p className="device-qr-device-no">
            DEVICE番号：<strong>{deviceNo}</strong>
          </p>

          <div className="device-qr-box">
            <QRCodeCanvas
              id="device-qr-code"
              value={qrUrl}
              size={240}
              level="M"
              includeMargin
            />
          </div>

          <p className="device-qr-url">
            {qrUrl}
          </p>
        </section>

        <div className="device-qr-actions no-print">
          <button type="button" onClick={downloadQrCode}>
            PNG保存
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => window.print()}
          >
            印刷
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate(`/device/${encodeURIComponent(deviceNo)}`)}
          >
            詳細へ戻る
          </button>

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

export default DeviceQrPage;