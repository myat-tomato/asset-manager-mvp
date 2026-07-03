import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { updateDevice, type Device } from '../services/deviceService';

type LoanPageState = {
  device?: Device;
};

function LoanPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LoanPageState | null;
  const device = state?.device;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [documentOutputDone, setDocumentOutputDone] = useState(false);

  useEffect(() => {
    function handleAfterPrint() {
      setDocumentOutputDone(true);
    }

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  function handlePrint() {
    setError('');
    window.print();
  }

  async function handleConfirmUpdate() {
    if (!device) {
      setError('更新対象のDEVICE情報がありません。');
      return;
    }

    if (!documentOutputDone) {
      setError('先に借用書を印刷、またはPDF保存してください。');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateDevice(device);

      navigate('/complete', {
        replace: true,
        state: {
          title: '貸出更新完了',
          message: '借用書出力後、DEVICE情報を更新しました。',
          deviceNo: device.deviceNo,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DEVICE情報の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  }

  if (!device) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>借用書出力</h1>

        <p style={{ color: 'red' }}>
          借用書を作成するDEVICE情報がありません。
        </p>

        <button type="button" onClick={() => navigate('/devices')}>
          DEVICE一覧へ戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            .loan-document {
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              max-width: none !important;
            }

            body {
              margin: 0;
            }

            @page {
              margin: 16mm;
            }
          }
        `}
      </style>

      <div className="no-print">
        <h1>借用書出力</h1>

        <p>
          借用書を印刷またはPDF保存した後、更新確定を押してください。
        </p>

        {error && (
          <p style={{ color: 'red' }}>
            エラー: {error}
          </p>
        )}

        {documentOutputDone && (
          <p style={{ color: 'green' }}>
            借用書の出力確認が完了しました。更新確定できます。
          </p>
        )}
      </div>

      <div
        className="loan-document"
        style={{
          border: '1px solid #333',
          padding: '24px',
          maxWidth: '720px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>DEVICE借用書</h2>

        <p>下記のDEVICEを借用します。</p>

        <table
          border={1}
          cellPadding={8}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '16px',
          }}
        >
          <tbody>
            <tr>
              <th style={{ width: '180px' }}>借用者</th>
              <td>{device.currentUser || '未入力'}</td>
            </tr>

            <tr>
              <th>DEVICE番号</th>
              <td>{device.deviceNo}</td>
            </tr>

            <tr>
              <th>DEVICE名</th>
              <td>{device.deviceName}</td>
            </tr>

            <tr>
              <th>状況</th>
              <td>{device.status}</td>
            </tr>

            <tr>
              <th>分類</th>
              <td>{device.classification}</td>
            </tr>

            <tr>
              <th>場所</th>
              <td>{device.location}</td>
            </tr>

            <tr>
              <th>用途</th>
              <td>{device.purpose}</td>
            </tr>

            <tr>
              <th>区分</th>
              <td>{device.category}</td>
            </tr>

            <tr>
              <th>貸出日</th>
              <td>{device.loanDate || new Date().toLocaleDateString('ja-JP')}</td>
            </tr>

            <tr>
              <th>備考</th>
              <td>{device.notes}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '48px' }}>
          <p>借用者署名: ______________________________</p>
          <p>管理担当者署名: __________________________</p>
        </div>
      </div>

      <div className="no-print">
        <button type="button" onClick={handlePrint} disabled={saving}>
          印刷 / PDF保存
        </button>

        <button
          type="button"
          onClick={handleConfirmUpdate}
          disabled={saving || !documentOutputDone}
          style={{ marginLeft: '8px' }}
        >
          {saving ? '更新中...' : '更新確定'}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={saving}
          style={{ marginLeft: '8px' }}
        >
          戻る
        </button>

        <button
          type="button"
          onClick={() => navigate('/devices')}
          disabled={saving}
          style={{ marginLeft: '8px' }}
        >
          DEVICE一覧へ
        </button>

        {!documentOutputDone && (
          <p style={{ marginTop: '12px', color: '#666' }}>
            先に「印刷 / PDF保存」を押してください。出力後に「更新確定」が押せるようになります。
          </p>
        )}
      </div>
    </div>
  );
}

export default LoanPage;