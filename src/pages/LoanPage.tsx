import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { updateDevice, type Device } from '../services/deviceService';

type LoanPageState = {
  device?: Device;
};

function getTodayText() {
  return new Date().toLocaleDateString('ja-JP');
}

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
      <main className="loan-page">
        <section className="loan-content">
          <h1 className="loan-title">借用書出力</h1>

          <p className="error-message" role="alert">
            借用書を作成するDEVICE情報がありません。
          </p>

          <div className="loan-actions">
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

  return (
    <main className="loan-page">
      <section className="loan-content">
        <header className="loan-header no-print">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            ← 戻る
          </button>

          <h1 className="loan-title">借用書出力</h1>

          <p className="loan-description">
            借用書を印刷またはPDF保存した後、更新確定を押してください。
          </p>
        </header>

        <div className="no-print">
          {error && (
            <p className="error-message" role="alert">
              エラー: {error}
            </p>
          )}

          {documentOutputDone && (
            <p className="success-message">
              借用書の出力確認が完了しました。更新確定できます。
            </p>
          )}
        </div>

        <section className="loan-document">
          <h2 className="loan-document-title">デバイス借用書</h2>

          <p className="loan-document-text">
            下記のデバイスを借用します。
          </p>

          <table className="loan-document-table">
            <tbody>
              <tr>
                <th>借用者</th>
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
                <td>{device.loanDate || getTodayText()}</td>
              </tr>

              <tr>
                <th>備考</th>
                <td>{device.notes || '-'}</td>
              </tr>
            </tbody>
          </table>

          <div className="loan-signature-area">
            <p>借用者署名　　　:　______________________________________</p>
            <p>管理担当者署名　:　______________________________________</p>
          </div>
        </section>

        <div className="loan-actions no-print">
          <button type="button" onClick={handlePrint} disabled={saving}>
            印刷 / PDF保存
          </button>

          <button
            type="button"
            onClick={handleConfirmUpdate}
            disabled={saving || !documentOutputDone}
          >
            {saving ? '更新中...' : '更新確定'}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            戻る
          </button>

          <button
            type="button"
            onClick={() => navigate('/devices')}
            disabled={saving}
          >
            DEVICE一覧へ
          </button>
        </div>

        {!documentOutputDone && (
          <p className="loan-note no-print">
            先に「印刷 / PDF保存」を押してください。出力後に「更新確定」が押せるようになります。
          </p>
        )}
      </section>
    </main>
  );
}

export default LoanPage;