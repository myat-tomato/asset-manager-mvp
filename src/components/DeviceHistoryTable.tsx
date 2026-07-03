import { useMemo, useState } from 'react';
import type { DeviceHistory } from '../services/historyService';

type DeviceHistoryTableProps = {
  historyList: DeviceHistory[];
};

type ChangeValue = {
  before?: unknown;
  after?: unknown;
};

type FormattedChange = {
  label: string;
  before: string;
  after: string;
  invalid?: boolean;
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

function formatUpdatedAt(value: string) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatChanges(changes: string): FormattedChange[] {
  if (!changes) {
    return [
      {
        label: '変更内容',
        before: '-',
        after: '変更内容なし',
      },
    ];
  }

  try {
    const parsed = JSON.parse(changes) as Record<string, unknown>;

    return Object.entries(parsed).map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;

      if (!isChangeValue(value)) {
        return {
          label,
          before: '-',
          after: '変更形式が不正です',
          invalid: true,
        };
      }

      return {
        label,
        before: formatValue(value.before),
        after: formatValue(value.after),
      };
    });
  } catch {
    return [
      {
        label: '変更内容',
        before: '-',
        after: '変更内容の解析に失敗しました。',
        invalid: true,
      },
    ];
  }
}

function getHistoryTime(value: string) {
  if (!value) return 0;

  const time = new Date(value).getTime();

  if (!Number.isNaN(time)) {
    return time;
  }

  // fallback for formats like 2026/07/03 10:30
  const normalizedValue = value.replace(/\//g, '-');
  const fallbackTime = new Date(normalizedValue).getTime();

  return Number.isNaN(fallbackTime) ? 0 : fallbackTime;
}

function DeviceHistoryTable({ historyList }: DeviceHistoryTableProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedHistoryList = useMemo(() => {
    return [...historyList].sort((a, b) => {
      return getHistoryTime(b.updatedAt) - getHistoryTime(a.updatedAt);
    });
  }, [historyList]);

  const shouldShowToggle = sortedHistoryList.length > 2;
  const visibleHistoryList = expanded
    ? sortedHistoryList
    : sortedHistoryList.slice(0, 2);

  if (historyList.length === 0) {
    return <p className="history-empty-message">更新履歴はありません。</p>;
  }

  return (
    <section className="history-section">
      <div className="history-list">
        {visibleHistoryList.map((history, index) => {
          const changes = formatChanges(history.changes);

          return (
            <article
              className="history-card"
              key={`${history.updatedAt}-${index}`}
            >
              <p className="history-line history-date">
                {formatUpdatedAt(history.updatedAt)}
              </p>

              <p className="history-line history-user">
                変更者：{history.updatedBy || '-'}
              </p>

              <div className="history-change-list">
                {changes.map((change, changeIndex) => (
                  <p
                    className={[
                      'history-line',
                      'history-change-line',
                      change.invalid ? 'history-change-invalid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={`${change.label}-${changeIndex}`}
                  >
                    {change.label}：{change.before} → {change.after}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {shouldShowToggle && (
        <button
          type="button"
          className="history-toggle-button button-secondary"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded
            ? '閉じる'
            : `もっと見る（残り${sortedHistoryList.length - 2}件）`}
        </button>
      )}
    </section>
  );
}

export default DeviceHistoryTable;