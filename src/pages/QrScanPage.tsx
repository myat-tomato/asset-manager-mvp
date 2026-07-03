import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function extractDeviceNoFromQrText(text: string) {
  const trimmed = text.trim();

  // Case 1: QR contains URL like http://xxx?deviceNo=110
  try {
    const url = new URL(trimmed);
    const deviceNoFromQuery = url.searchParams.get('deviceNo');

    if (deviceNoFromQuery) {
      return deviceNoFromQuery.trim();
    }

    // Case 2: QR contains URL path like /device/110
    const match = url.pathname.match(/\/device\/([^/]+)/);

    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim();
    }
  } catch {
    // Not a URL. Continue below.
  }

  // Case 3: QR contains only raw DEVICE number like 110
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
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (hasScannedRef.current) return;

        hasScannedRef.current = true;
        setScannedText(decodedText);

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
        // Ignore scan failure per frame.
      }
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
    <div style={{ padding: '24px' }}>
      <h1>QRコード読取</h1>

      <p>DEVICEに貼られたQRコードをカメラで読み取ります。</p>

      {error && (
        <p style={{ color: 'red' }}>
          エラー: {error}
        </p>
      )}

      {scannedText && (
        <div style={{ marginBottom: '16px' }}>
          <p>読み取り内容:</p>
          <p style={{ wordBreak: 'break-all' }}>{scannedText}</p>
        </div>
      )}

      <div
        id="qr-reader"
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      />

      <div style={{ marginTop: '16px' }}>
        <button type="button" onClick={() => navigate('/')}>
          メニューへ戻る
        </button>

        <button
          type="button"
          onClick={() => navigate('/devices')}
          style={{ marginLeft: '8px' }}
        >
          DEVICE一覧へ
        </button>
      </div>

      <p style={{ marginTop: '16px', color: '#666' }}>
        カメラが起動しない場合は、ブラウザのカメラ許可とHTTPS環境を確認してください。
      </p>
    </div>
  );
}

export default QrScanPage;