import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createDevice,
  type CreateDevicePayload,
} from '../services/deviceService';
import {
  getDeviceOptions,
  type DeviceOptions,
} from '../services/optionService';
import EmployeeSearchSelect from '../components/EmployeeSearchSelect';

const emptyOptions: DeviceOptions = {
  currentUsers: [],
  statuses: [],
  classifications: [],
  locations: [],
  purposes: [],
  categories: [],
};

const initialForm: CreateDevicePayload = {
  deviceNo: '',
  deviceName: '',
  status: '',
  classification: '',
  purpose: '',
  category: '',
  currentUser: '',
  employmentStatus: '',
  previousUser: '',
  location: '',
  condition: '',
  notes: '',
  loanDate: '',
  loanSlip: '',
  manufacturer: '',
  modelName: '',
  cpu: '',
  ram: '',
  purchaseDate: '',
  osName: '',
  osLicense: '',
  backupImageDate: '',
  loginAccount: '',
  officeLicense: '',
  ip: '',
};

type FieldShellProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

function FieldShell({ label, required, children }: FieldShellProps) {
  return (
    <label className="qr-generate-field">
      <span className="qr-generate-field-label">
        {label}
        {required && <span className="required-mark"> *</span>}
      </span>
      {children}
    </label>
  );
}

function QrGeneratePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateDevicePayload>(initialForm);
  const [options, setOptions] = useState<DeviceOptions>(emptyOptions);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOptionsLoading(true);
    setError('');

    getDeviceOptions()
      .then(setOptions)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : '選択肢の取得に失敗しました。',
        );
      })
      .finally(() => {
        setOptionsLoading(false);
      });
  }, []);

  function updateField<K extends keyof CreateDevicePayload>(
    key: K,
    value: CreateDevicePayload[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateForm() {
    if (!form.deviceNo.trim()) return 'デバイス番号を入力してください。';
    if (!form.deviceName.trim()) return 'デバイス名を入力してください。';
    if (!form.status) return '状況を選択してください。';
    if (!form.classification) return '分類を選択してください。';
    if (!form.location) return '場所を選択してください。';
    if (!form.purpose) return '用途を選択してください。';
    if (!form.category) return '区分を選択してください。';

    return '';
  }

  async function handleCreateDevice() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = await createDevice({
        ...form,
        deviceNo: form.deviceNo.trim(),
        deviceName: form.deviceName.trim(),
      });

      const createdDeviceNo = created.deviceNo || form.deviceNo.trim();

      navigate('/complete', {
        state: {
          title: '登録完了',
          message: 'デバイス登録が完了しました。以下のQRコードを保存または印刷してください。',
          deviceNo: createdDeviceNo,
          showQr: true,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'デバイス登録に失敗しました。',
      );
    } finally {
      setSaving(false);
    }
  }

  function renderInputField(
    label: string,
    key: keyof CreateDevicePayload,
    required = false,
    type = 'text',
    placeholder = '',
  ) {
    return (
      <FieldShell label={label} required={required}>
        <input
          type={type}
          value={String(form[key] ?? '')}
          placeholder={placeholder}
          onChange={(e) => updateField(key, e.target.value)}
          disabled={saving}
        />
      </FieldShell>
    );
  }

  function renderSelectField(
    label: string,
    key: keyof CreateDevicePayload,
    values: string[],
    required = false,
  ) {
    return (
      <FieldShell label={label} required={required}>
        <select
          value={String(form[key] ?? '')}
          onChange={(e) => updateField(key, e.target.value)}
          disabled={saving || optionsLoading}
        >
          <option value="">選択してください</option>
          {values.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  return (
    <main className="qr-generate-page">
      <section className="qr-generate-content">
        <header className="qr-generate-header">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            ← メニュー
          </button>

          <h1 className="qr-generate-title">新規デバイス登録</h1>

          <p className="qr-generate-description">
            デバイス情報を登録後、QRコードを保存または印刷できます。
          </p>
        </header>

        {optionsLoading && (
          <p className="loading-message">
            選択肢を読み込み中...
          </p>
        )}

        {error && (
          <p className="error-message" role="alert">
            エラー: {error}
          </p>
        )}

        <section className="qr-generate-section">
          <h2 className="qr-generate-section-title">基本情報</h2>

          <div className="qr-generate-form-grid">
            {renderInputField('デバイス番号', 'deviceNo', true, 'text', '例: 110')}
            {renderInputField('デバイス名', 'deviceName', true, 'text', '例: Dell-001 / iPad-001')}

            <FieldShell label="現在使用者">
              <EmployeeSearchSelect
                value={form.currentUser}
                disabled={saving}
                onChange={(employee, displayName) => {
                  updateField('currentUser', displayName);

                  if (employee) {
                    updateField('employmentStatus', employee.status);
                  }
                }}
              />
            </FieldShell>

            {renderSelectField('状況', 'status', options.statuses, true)}
            {renderSelectField('分類', 'classification', options.classifications, true)}
            {renderSelectField('場所', 'location', options.locations, true)}
            {renderSelectField('用途', 'purpose', options.purposes, true)}
            {renderSelectField('区分', 'category', options.categories, true)}
          </div>
        </section>

        <details className="qr-generate-section">
          <summary className="qr-generate-section-title">
            利用者・貸出情報
          </summary>

          <div className="qr-generate-form-grid">
            {renderInputField('雇用形態', 'employmentStatus')}
            {renderInputField('前使用者', 'previousUser')}
            {renderInputField('状態', 'condition')}
            {renderInputField('貸出日', 'loanDate', false, 'date')}
            {renderInputField('借用書', 'loanSlip')}

            <FieldShell label="備考">
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                disabled={saving}
                rows={3}
              />
            </FieldShell>
          </div>
        </details>

        <details className="qr-generate-section">
          <summary className="qr-generate-section-title">
            端末スペック
          </summary>

          <div className="qr-generate-form-grid">
            {renderInputField('メーカー', 'manufacturer', false, 'text', '例: Dell / Apple')}
            {renderInputField('機種名', 'modelName', false, 'text', '例: Latitude 5420 / iPad')}
            {renderInputField('CPU', 'cpu')}
            {renderInputField('RAM', 'ram')}
            {renderInputField('購入日', 'purchaseDate', false, 'date')}
          </div>
        </details>

        <details className="qr-generate-section">
          <summary className="qr-generate-section-title">
            OS・ライセンス・ネットワーク
          </summary>

          <div className="qr-generate-form-grid">
            {renderInputField('OS', 'osName')}
            {renderInputField('OSライセンス', 'osLicense')}
            {renderInputField('バックアップイメージ日', 'backupImageDate', false, 'date')}
            {renderInputField('ログインアカウント', 'loginAccount')}
            {renderInputField('Officeライセンス', 'officeLicense')}
            {renderInputField('IP', 'ip')}
          </div>
        </details>

        <div className="qr-generate-actions">
          <button
            type="button"
            onClick={handleCreateDevice}
            disabled={saving || optionsLoading}
          >
            {saving ? '登録中...' : '登録'}
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate('/devices')}
            disabled={saving}
          >
            DEVICE一覧へ
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            メニューへ戻る
          </button>
        </div>
      </section>
    </main>
  );
}

export default QrGeneratePage;