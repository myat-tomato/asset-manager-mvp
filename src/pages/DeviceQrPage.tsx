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
    return <div style={{ padding: '24px' }}>DEVICE番号が見つかりません。</div>;
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
    <div style={{ padding: '24px' }}>
      <h1>QRコード生成</h1>

      <p>DEVICE番号: {deviceNo}</p>

      <div
        style={{
          display: 'inline-block',
          padding: '16px',
          border: '1px solid #ccc',
          background: '#fff',
          marginBottom: '16px',
        }}
      >
        <QRCodeCanvas
          id="device-qr-code"
          value={qrUrl}
          size={240}
          level="M"
          includeMargin
        />
      </div>

      <p style={{ wordBreak: 'break-all' }}>
        {qrUrl}
      </p>

      <div style={{ marginTop: '16px' }}>
        <button onClick={downloadQrCode}>PNG保存</button>

        <button onClick={() => window.print()} style={{ marginLeft: '8px' }}>
          印刷
        </button>

        <button onClick={() => navigate(`/device/${deviceNo}`)} style={{ marginLeft: '8px' }}>
          詳細へ戻る
        </button>

        <button onClick={() => navigate('/devices')} style={{ marginLeft: '8px' }}>
          DEVICE一覧へ戻る
        </button>
      </div>
    </div>
  );
}

export default DeviceQrPage;