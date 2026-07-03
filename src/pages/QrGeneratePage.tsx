import { useEffect, useState } from 'react';
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
                        : '選択肢の取得に失敗しました。'
                );
            })
            .finally(() => {
                setOptionsLoading(false);
            });
    }, []);

    function updateField<K extends keyof CreateDevicePayload>(
        key: K,
        value: CreateDevicePayload[K]
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function validateForm() {
        if (!form.deviceNo.trim()) {
            return 'デバイス番号を入力してください。';
        }

        if (!form.deviceName.trim()) {
            return 'デバイス名を入力してください。';
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
                err instanceof Error ? err.message : 'デバイス登録に失敗しました。'
            );
        } finally {
            setSaving(false);
        }
    }

    const inputDisabled = saving;
    const selectDisabled = saving || optionsLoading;

    return (
        <div style={{ padding: '24px' }}>
            <h1>QRコード生成 / 新規デバイス登録</h1>
            <p>
                新しいデバイスを登録します。登録完了後、完了画面からQRコード表示画面へ遷移できます。
            </p>

            {optionsLoading && <p>選択肢を読み込み中...</p>}

            {error && (
                <p style={{ color: 'red' }}>
                    エラー: {error}
                </p>
            )}

            <div
                style={{
                    display: 'grid',
                    gap: '12px',
                    maxWidth: '560px',
                    marginBottom: '24px',
                }}
            >
                <label>
                    デバイス番号 <span style={{ color: 'red' }}>*</span>
                    <input
                        value={form.deviceNo}
                        onChange={(e) => updateField('deviceNo', e.target.value)}
                        placeholder="例: 110"
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    デバイス名 <span style={{ color: 'red' }}>*</span>
                    <input
                        value={form.deviceName}
                        onChange={(e) => updateField('deviceName', e.target.value)}
                        placeholder="例: Dell-001 / iPad-001"
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
                        disabled={selectDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    >
                        <option value="">選択してください</option>
                        {options.statuses.map((option) => (
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
                        disabled={selectDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    >
                        <option value="">選択してください</option>
                        {options.classifications.map((option) => (
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
                        disabled={selectDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    >
                        <option value="">選択してください</option>
                        {options.locations.map((option) => (
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
                        disabled={selectDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    >
                        <option value="">選択してください</option>
                        {options.purposes.map((option) => (
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
                        disabled={selectDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    >
                        <option value="">選択してください</option>
                        {options.categories.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    雇用形態
                    <input
                        value={form.employmentStatus}
                        onChange={(e) => updateField('employmentStatus', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    前使用者
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
                    貸出日
                    <input
                        type="date"
                        value={form.loanDate}
                        onChange={(e) => updateField('loanDate', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    借用書
                    <input
                        value={form.loanSlip}
                        onChange={(e) => updateField('loanSlip', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    メーカー
                    <input
                        value={form.manufacturer}
                        onChange={(e) => updateField('manufacturer', e.target.value)}
                        placeholder="例: Dell / Apple"
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    機種名
                    <input
                        value={form.modelName}
                        onChange={(e) => updateField('modelName', e.target.value)}
                        placeholder="例: Latitude 5420 / iPad"
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
                        type="date"
                        value={form.purchaseDate}
                        onChange={(e) => updateField('purchaseDate', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    OS
                    <input
                        value={form.osName}
                        onChange={(e) => updateField('osName', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    OSライセンス
                    <input
                        value={form.osLicense}
                        onChange={(e) => updateField('osLicense', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    バックアップイメージ日
                    <input
                        type="date"
                        value={form.backupImageDate}
                        onChange={(e) => updateField('backupImageDate', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    ログインアカウント
                    <input
                        value={form.loginAccount}
                        onChange={(e) => updateField('loginAccount', e.target.value)}
                        disabled={inputDisabled}
                        style={{ display: 'block', padding: '8px', width: '100%' }}
                    />
                </label>

                <label>
                    Officeライセンス
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
            </div>

            <div style={{ marginBottom: '24px' }}>
                <button
                    type="button"
                    onClick={handleCreateDevice}
                    disabled={saving || optionsLoading}
                >
                    {saving ? '登録中...' : '登録'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{ marginLeft: '8px' }}
                >
                    メニューへ戻る
                </button>
            </div>
        </div>
    );
}

export default QrGeneratePage;