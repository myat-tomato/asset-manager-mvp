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
  const baseUrl = (import.meta.env.VITE_APP_BASE_URL || window.location.origin).replace(/\/$/, '');
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
    if (!deviceNo) return;

    const canvas = qrContainerRef.current?.querySelector('canvas');

    if (!canvas) return;

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
    <main className="complete-page">
      <section className="complete-content">
        <div className="complete-icon">
          ✓
        </div>

        <h1 className="complete-title">{title}</h1>

        <p className="complete-message">
          {message}
        </p>

        {deviceNo && (
          <p className="complete-device-no">
            デバイス番号：<strong>{deviceNo}</strong>
          </p>
        )}

        {showQr && (
          <section className="complete-qr-section">
            <div className="complete-qr-print-area">
              <h2 className="complete-qr-title">QRコード</h2>

              <p className="complete-qr-description">
                このQRコードを読み取ると、対象デバイスの詳細画面へアクセスできます。
              </p>

              <div className="complete-qr-box" ref={qrContainerRef}>
                <QRCodeCanvas
                  value={qrUrl}
                  size={240}
                  level="M"
                  includeMargin
                />
              </div>

              <p className="complete-qr-url">
                {qrUrl}
              </p>
            </div>

            <div className="complete-qr-actions no-print">
              <button type="button" onClick={handleDownloadQr}>
                PNG保存
              </button>

              <button
                type="button"
                onClick={handlePrintQr}
              >
                印刷 / PDF保存
              </button>
            </div>
          </section>
        )}

        <div className="complete-actions no-print">
          {deviceNo && (
            <button
              type="button"
              onClick={() => navigate(`/device/${encodeURIComponent(deviceNo)}`)}
            >
              デバイス詳細へ
            </button>
          )}

          {deviceNo && !showQr && (
            <button
              type="button"
              onClick={() => navigate(`/device/${encodeURIComponent(deviceNo)}/qr`)}
            >
              QR表示画面へ
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/devices')}
          >
            デバイス一覧へ
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
          >
            メニューへ
          </button>
        </div>
      </section>
    </main>
  );
}

export default CompletePage;