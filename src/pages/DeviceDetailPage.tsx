import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getDeviceByNo, updateDevice, type Device } from '../services/deviceService';
import { getDeviceOptions, type DeviceOptions } from '../services/optionService';
import { getDeviceHistory, type DeviceHistory } from '../services/historyService';
import DeviceHistoryTable from '../components/DeviceHistoryTable';
import EmployeeSearchSelect from '../components/EmployeeSearchSelect';

const emptyOptions: DeviceOptions = {
  currentUsers: [],
  statuses: [],
  classifications: [],
  locations: [],
  purposes: [],
  categories: [],
};

const emptyDevice: Device = {
  status: '',
  classification: '',
  purpose: '',
  category: '',
  deviceNo: '',
  deviceName: '',
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

function normalizeDevice(device: Device): Device {
  return {
    ...emptyDevice,
    ...device,
    deviceNo: String(device.deviceNo ?? ''),
    deviceName: String(device.deviceName ?? ''),
    status: String(device.status ?? ''),
    classification: String(device.classification ?? ''),
    purpose: String(device.purpose ?? ''),
    category: String(device.category ?? ''),
    currentUser: String(device.currentUser ?? ''),
    employmentStatus: String(device.employmentStatus ?? ''),
    previousUser: String(device.previousUser ?? ''),
    location: String(device.location ?? ''),
    condition: String(device.condition ?? ''),
    notes: String(device.notes ?? ''),
    loanDate: String(device.loanDate ?? ''),
    loanSlip: String(device.loanSlip ?? ''),
    manufacturer: String(device.manufacturer ?? ''),
    modelName: String(device.modelName ?? ''),
    cpu: String(device.cpu ?? ''),
    ram: String(device.ram ?? ''),
    purchaseDate: String(device.purchaseDate ?? ''),
    osName: String(device.osName ?? ''),
    osLicense: String(device.osLicense ?? ''),
    backupImageDate: String(device.backupImageDate ?? ''),
    loginAccount: String(device.loginAccount ?? ''),
    officeLicense: String(device.officeLicense ?? ''),
    ip: String(device.ip ?? ''),
  };
}

function getOptionsWithCurrent(options: string[], currentValue: string) {
  if (!currentValue) return options;
  if (options.includes(currentValue)) return options;
  return [currentValue, ...options];
}

type FieldShellProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FieldShell({ label, required, children }: FieldShellProps) {
  return (
    <label className="detail-field">
      <span className="detail-field-label">
        {label}
        {required && <span className="required-mark"> *</span>}
      </span>
      {children}
    </label>
  );
}

function DeviceDetailPage() {
  const { deviceNo } = useParams();
  const navigate = useNavigate();

  const [originalDevice, setOriginalDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<Device>(emptyDevice);
  const [options, setOptions] = useState<DeviceOptions>(emptyOptions);
  const [historyList, setHistoryList] = useState<DeviceHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!deviceNo) {
      setError('DEVICE番号が指定されていません。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    Promise.all([
      getDeviceByNo(deviceNo),
      getDeviceOptions(),
      getDeviceHistory(deviceNo),
    ])
      .then(([deviceData, optionData, historyData]) => {
        setHistoryList(historyData);

        if (!deviceData) {
          setOriginalDevice(null);
          setForm(emptyDevice);
          setOptions(optionData);
          return;
        }

        const normalizedDevice = normalizeDevice(deviceData);

        setOriginalDevice(normalizedDevice);
        setForm(normalizedDevice);
        setOptions(optionData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'データ取得に失敗しました。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [deviceNo]);

  function updateField<K extends keyof Device>(key: K, value: Device[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateTextField<K extends keyof Device>(key: K, value: string) {
    updateField(key, value as Device[K]);
  }

  function validateForm() {
    if (!form.deviceNo.trim()) return 'DEVICE番号が指定されていません。';
    if (!form.deviceName.trim()) return 'DEVICE名を入力してください。';
    if (!form.status) return '状況を選択してください。';
    if (!form.classification) return '分類を選択してください。';
    if (!form.location) return '場所を選択してください。';
    if (!form.purpose) return '用途を選択してください。';
    if (!form.category) return '区分を選択してください。';
    return '';
  }

  async function handleSave() {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setMessage('');
      return;
    }

    const deviceToSave: Device = {
      ...form,
      deviceNo: form.deviceNo.trim(),
      deviceName: form.deviceName.trim(),
    };

    if (deviceToSave.classification.includes('貸出')) {
      navigate('/loan', {
        state: {
          device: deviceToSave,
        },
      });
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateDevice(deviceToSave);

      navigate('/complete', {
        replace: true,
        state: {
          title: '更新完了',
          message: 'DEVICE情報を更新しました。',
          deviceNo: deviceToSave.deviceNo,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DEVICE情報の更新に失敗しました。');
    } finally {
      setSaving(false);
    }
  }

  function renderSelectField(
    label: string,
    key: keyof Device,
    values: string[],
    required = false,
  ) {
    const currentValue = String(form[key] ?? '');

    return (
      <FieldShell label={label} required={required}>
        <select
          value={currentValue}
          onChange={(e) => updateTextField(key, e.target.value)}
          disabled={saving}
        >
          <option value="">選択してください</option>
          {getOptionsWithCurrent(values, currentValue).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  function renderInputField(
    label: string,
    key: keyof Device,
    required = false,
    disabled = saving,
  ) {
    return (
      <FieldShell label={label} required={required}>
        <input
          value={String(form[key] ?? '')}
          onChange={(e) => updateTextField(key, e.target.value)}
          disabled={disabled}
        />
      </FieldShell>
    );
  }

  if (loading) {
    return (
      <main className="device-detail-page">
        <p className="loading-message">読み込み中...</p>
      </main>
    );
  }

  if (error && !originalDevice) {
    return (
      <main className="device-detail-page">
        <p className="error-message" role="alert">
          エラー: {error}
        </p>

        <button type="button" className="button-secondary" onClick={() => navigate('/devices')}>
          DEVICE一覧へ戻る
        </button>
      </main>
    );
  }

  if (!originalDevice) {
    return (
      <main className="device-detail-page">
        <section className="device-detail-content">
          <h1 className="device-detail-title">DEVICE詳細</h1>
          <p className="device-detail-muted">対象DEVICEが見つかりません。</p>

          <button type="button" className="button-secondary" onClick={() => navigate('/devices')}>
            DEVICE一覧へ戻る
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="device-detail-page">
      <section className="device-detail-content">
        <header className="device-detail-header">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate('/devices')}
            disabled={saving}
          >
            ← 一覧
          </button>
          <p className="device-detail-no">{form.deviceNo}</p>

          <section className="detail-history-section">
            <h2 className="detail-section-title">更新履歴</h2>
            <DeviceHistoryTable historyList={historyList} />
          </section>

          <h1 className="device-detail-title">DEVICE詳細・編集</h1>
        </header>

        {error && (
          <p className="error-message" role="alert">
            エラー: {error}
          </p>
        )}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        <section className="detail-section">
          <h2 className="detail-section-title">基本情報</h2>

          <div className="detail-form-grid">
            {renderInputField('番号', 'deviceNo', false, true)}
            {renderInputField('DEVICE名', 'deviceName', true)}

            <FieldShell label="現在使用者">
              <EmployeeSearchSelect
                value={form.currentUser}
                disabled={saving}
                onChange={(employee, displayName) => {
                  updateTextField('currentUser', displayName);

                  if (employee) {
                    updateTextField('employmentStatus', employee.status);
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

        <details className="detail-section">
          <summary className="detail-section-title">利用者・貸出情報</summary>

          <div className="detail-form-grid">
            {renderInputField('在/退職', 'employmentStatus')}
            {renderInputField('以前使用者', 'previousUser')}
            {renderInputField('状態', 'condition')}
            {renderInputField('貸出日', 'loanDate')}
            {renderInputField('貸出証', 'loanSlip')}

            <FieldShell label="備考">
              <textarea
                value={form.notes}
                onChange={(e) => updateTextField('notes', e.target.value)}
                disabled={saving}
                rows={3}
              />
            </FieldShell>
          </div>
        </details>

        <details className="detail-section">
          <summary className="detail-section-title">端末スペック</summary>

          <div className="detail-form-grid">
            {renderInputField('製造社', 'manufacturer')}
            {renderInputField('モデル名', 'modelName')}
            {renderInputField('CPU', 'cpu')}
            {renderInputField('RAM', 'ram')}
            {renderInputField('購入日', 'purchaseDate')}
          </div>
        </details>

        <details className="detail-section">
          <summary className="detail-section-title">OS・ライセンス・ネットワーク</summary>

          <div className="detail-form-grid">
            {renderInputField('OS名', 'osName')}
            {renderInputField('OS Licence', 'osLicense')}
            {renderInputField('バックアップイメージ作成日', 'backupImageDate')}
            {renderInputField('ログインアカウント/パスワード/PIN', 'loginAccount')}
            {renderInputField('Office Licence', 'officeLicense')}
            {renderInputField('IP', 'ip')}
          </div>
        </details>

        <div className="detail-action-area">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/device/${encodeURIComponent(form.deviceNo)}/qr`)}
            disabled={saving}
          >
            QR表示
          </button>

          <button
            type="button"
            onClick={() => navigate('/devices')}
            disabled={saving}
          >
            一覧へ戻る
          </button>
        </div>
      </section>
    </main>
  );
}

export default DeviceDetailPage;