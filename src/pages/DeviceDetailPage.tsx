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

  if (options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
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

  function validateForm() {
    if (!form.deviceNo.trim()) {
      return 'DEVICE番号が指定されていません。';
    }

    if (!form.deviceName.trim()) {
      return 'DEVICE名を入力してください。';
    }

    if (!form.status) {
      return '状況を選択してください。';
    }

    if (!form.classification) {
      return '分類を選択してください。';
    }

    if (!form.location) {
      return '場所を選択してください。';
    }

    if (!form.purpose) {
      return '用途を選択してください。';
    }

    if (!form.category) {
      return '区分を選択してください。';
    }

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

  if (loading) {
    return <div style={{ padding: '24px' }}>読み込み中...</div>;
  }

  if (error && !originalDevice) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        エラー: {error}
        <br />
        <button type="button" onClick={() => navigate('/devices')}>
          DEVICE一覧へ戻る
        </button>
      </div>
    );
  }

  if (!originalDevice) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>DEVICE詳細</h1>
        <p>対象DEVICEが見つかりません。</p>
        <button type="button" onClick={() => navigate('/devices')}>
          DEVICE一覧へ戻る
        </button>
      </div>
    );
  }

  const inputDisabled = saving;

  return (
    <div style={{ padding: '24px' }}>
      <h1>DEVICE詳細・編集</h1>

      {error && (
        <p style={{ color: 'red' }}>
          エラー: {error}
        </p>
      )}

      {message && (
        <p style={{ color: 'green' }}>
          {message}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gap: '12px',
          maxWidth: '620px',
          marginBottom: '24px',
        }}
      >
        <label>
          番号
          <input
            value={form.deviceNo}
            disabled
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          DEVICE名 <span style={{ color: 'red' }}>*</span>
          <input
            value={form.deviceName}
            onChange={(e) => updateField('deviceName', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          現在使用者
          <EmployeeSearchSelect
            value={form.currentUser}
            disabled={inputDisabled}
            onChange={(employee, displayName) => {
              updateField('currentUser', displayName);

              if (employee) {
                updateField('employmentStatus', employee.status);
              }
            }}
          />
        </label>

        <label>
          状況 <span style={{ color: 'red' }}>*</span>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          >
            <option value="">選択してください</option>
            {getOptionsWithCurrent(options.statuses, form.status).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          分類 <span style={{ color: 'red' }}>*</span>
          <select
            value={form.classification}
            onChange={(e) => updateField('classification', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          >
            <option value="">選択してください</option>
            {getOptionsWithCurrent(options.classifications, form.classification).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          場所 <span style={{ color: 'red' }}>*</span>
          <select
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          >
            <option value="">選択してください</option>
            {getOptionsWithCurrent(options.locations, form.location).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          用途 <span style={{ color: 'red' }}>*</span>
          <select
            value={form.purpose}
            onChange={(e) => updateField('purpose', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          >
            <option value="">選択してください</option>
            {getOptionsWithCurrent(options.purposes, form.purpose).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          区分 <span style={{ color: 'red' }}>*</span>
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          >
            <option value="">選択してください</option>
            {getOptionsWithCurrent(options.categories, form.category).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          在/退職
          <input
            value={form.employmentStatus}
            onChange={(e) => updateField('employmentStatus', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          以前使用者
          <input
            value={form.previousUser}
            onChange={(e) => updateField('previousUser', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          状態
          <input
            value={form.condition}
            onChange={(e) => updateField('condition', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          備考
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            disabled={inputDisabled}
            style={{
              display: 'block',
              padding: '8px',
              width: '100%',
              minHeight: '80px',
            }}
          />
        </label>

        <label>
          貸出日
          <input
            value={form.loanDate}
            onChange={(e) => updateField('loanDate', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          貸出証
          <input
            value={form.loanSlip}
            onChange={(e) => updateField('loanSlip', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          製造社
          <input
            value={form.manufacturer}
            onChange={(e) => updateField('manufacturer', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          モデル名
          <input
            value={form.modelName}
            onChange={(e) => updateField('modelName', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          CPU
          <input
            value={form.cpu}
            onChange={(e) => updateField('cpu', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          RAM
          <input
            value={form.ram}
            onChange={(e) => updateField('ram', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          購入日
          <input
            value={form.purchaseDate}
            onChange={(e) => updateField('purchaseDate', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          OS名
          <input
            value={form.osName}
            onChange={(e) => updateField('osName', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          OS Licence
          <input
            value={form.osLicense}
            onChange={(e) => updateField('osLicense', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          バックアップイメージ作成日
          <input
            value={form.backupImageDate}
            onChange={(e) => updateField('backupImageDate', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          ログインアカウント/パスワード/PIN
          <input
            value={form.loginAccount}
            onChange={(e) => updateField('loginAccount', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          Office Licence
          <input
            value={form.officeLicense}
            onChange={(e) => updateField('officeLicense', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>

        <label>
          IP
          <input
            value={form.ip}
            onChange={(e) => updateField('ip', e.target.value)}
            disabled={inputDisabled}
            style={{ display: 'block', padding: '8px', width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/device/${encodeURIComponent(form.deviceNo)}/qr`)}
          disabled={saving}
          style={{ marginLeft: '8px' }}
        >
          QR表示
        </button>

        <button
          type="button"
          onClick={() => navigate('/devices')}
          disabled={saving}
          style={{ marginLeft: '8px' }}
        >
          DEVICE一覧へ戻る
        </button>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2>更新履歴</h2>
        <DeviceHistoryTable historyList={historyList} />
      </div>
    </div>
  );
}

export default DeviceDetailPage;