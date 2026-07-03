import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function extractDeviceNoFromQrText(text: string) {
  const trimmed = text.trim();

  try {
    const url = new URL(trimmed);
    const deviceNoFromQuery = url.searchParams.get('deviceNo');

    if (deviceNoFromQuery) {
      return deviceNoFromQuery.trim();
    }

    const match = url.pathname.match(/\/device\/([^/]+)/);

    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim();
    }
  } catch {
    // Not a URL. Continue below.
  }

  if (trimmed) {
    return trimmed;
  }

  return '';
}

function QrScanPage() {
  const navigate = useNavigate();

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasScannedRef = useRef(false);

  const [error, setError] = useState('');
  const [scannedText, setScannedText] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (hasScannedRef.current) return;

        hasScannedRef.current = true;
        setScannedText(decodedText);
        setError('');

        const deviceNo = extractDeviceNoFromQrText(decodedText);

        if (!deviceNo) {
          setError('QRコードからDEVICE番号を取得できませんでした。');
          hasScannedRef.current = false;
          return;
        }

        scanner
          .clear()
          .catch(() => {
            // scanner cleanup failed, but navigation can continue
          })
          .finally(() => {
            navigate(`/device/${encodeURIComponent(deviceNo)}`);
          });
      },
      () => {
        setCameraReady(true);
      },
    );

    return () => {
      scanner
        .clear()
        .catch(() => {
          // Ignore cleanup error
        });
    };
  }, [navigate]);

  return (
    <main className="qr-scan-page">
      <section className="qr-scan-content">
        <header className="qr-scan-header">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate('/')}
          >
            ← メニュー
          </button>

          <h1 className="qr-scan-title">QRコード読取</h1>

          <p className="qr-scan-description">
            DEVICEに貼られたQRコードをカメラで読み取ります。
          </p>
        </header>

        {error && (
          <p className="error-message" role="alert">
            エラー: {error}
          </p>
        )}

        {scannedText && (
          <div className="qr-scan-result">
            <p className="qr-scan-result-label">読み取り内容</p>
            <p className="qr-scan-result-text">{scannedText}</p>
          </div>
        )}

        {!cameraReady && (
          <p className="loading-message">
            カメラを起動しています...
          </p>
        )}

        <div className="qr-reader-wrapper">
          <div id="qr-reader" />
        </div>

        <div className="qr-scan-actions">
          <button type="button" onClick={() => navigate('/')}>
            メニューへ戻る
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate('/devices')}
          >
            DEVICE一覧へ
          </button>
        </div>

        <p className="qr-scan-note">
          カメラが起動しない場合は、ブラウザのカメラ許可とHTTPS環境を確認してください。
        </p>
      </section>
    </main>
  );
}

export default QrScanPage;