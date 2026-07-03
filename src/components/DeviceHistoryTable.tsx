import type { DeviceHistory } from '../services/historyService';

type DeviceHistoryTableProps = {
  historyList: DeviceHistory[];
};

type ChangeValue = {
  before?: unknown;
  after?: unknown;
};

const FIELD_LABELS: Record<string, string> = {
  status: '状況',
  classification: '分類',
  purpose: '用途',
  category: '区分',
  deviceNo: 'デバイス番号',
  deviceName: 'デバイス名',
  currentUser: '現在使用者',
  employmentStatus: '在/退職',
  previousUser: '以前使用者',
  location: '場所',
  condition: '状態',
  notes: '備考',
  loanDate: '貸出日',
  loanSlip: '貸出証',
  manufacturer: '製造社',
  modelName: 'モデル名',
  cpu: 'CPU',
  ram: 'RAM',
  purchaseDate: '購入日',
  osName: 'OS名',
  osLicense: 'OS Licence',
  backupImageDate: 'バックアップイメージ作成日',
  loginAccount: 'ログインアカウント/パスワード/PIN',
  officeLicense: 'Office Licence',
  ip: 'IP',
  action: '処理',
};

function formatValue(value: unknown) {
  const text = String(value ?? '').trim();
  return text || '未設定';
}

function isChangeValue(value: unknown): value is ChangeValue {
  return typeof value === 'object' && value !== null;
}

function formatChanges(changes: string) {
  if (!changes) {
    return ['変更内容なし'];
  }

  try {
    const parsed = JSON.parse(changes) as Record<string, unknown>;

    return Object.entries(parsed).map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;

      if (!isChangeValue(value)) {
        return `${label}：変更形式が不正です`;
      }

      return `${label}：${formatValue(value.before)} → ${formatValue(
        value.after
      )}`;
    });
  } catch {
    return ['変更内容の解析に失敗しました。'];
  }
}

function DeviceHistoryTable({ historyList }: DeviceHistoryTableProps) {
  if (historyList.length === 0) {
    return <p>更新履歴はありません。</p>;
  }

  return (
    <table
      border={1}
      cellPadding={8}
      style={{
        borderCollapse: 'collapse',
        width: '100%',
      }}
    >
      <thead>
        <tr>
          <th>更新日時</th>
          <th>更新者</th>
          <th>変更内容</th>
        </tr>
      </thead>

      <tbody>
        {historyList.map((history, index) => (
          <tr key={`${history.updatedAt}-${index}`}>
            <td>{history.updatedAt}</td>
            <td>{history.updatedBy || '-'}</td>
            <td>
              {formatChanges(history.changes).map((line, lineIndex) => (
                <div key={lineIndex}>{line}</div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DeviceHistoryTable;