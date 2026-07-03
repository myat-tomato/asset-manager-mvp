import { useEffect, useMemo, useRef, useState } from 'react';

import { getEmployeeList, type Employee } from '../services/employeeService';

type EmployeeSearchSelectProps = {
  value: string;
  disabled?: boolean;
  onChange: (employee: Employee | null, displayName: string) => void;
};

function getEmployeeLabel(employee: Employee) {
  return (
    employee.displayName ||
    `${employee.employeeNo} ${employee.name}`.trim() ||
    employee.englishName ||
    employee.furigana ||
    employee.koreanName
  );
}

function getEmployeeSearchText(employee: Employee) {
  return [
    employee.employeeNo,
    employee.name,
    employee.position,
    employee.displayName,
    employee.koreanName,
    employee.englishName,
    employee.furigana,
    employee.status,
    employee.nationality,
    employee.startDate,
    employee.endDate,
  ]
    .join(' ')
    .toLowerCase();
}

function EmployeeSearchSelect({
  value,
  disabled = false,
  onChange,
}: EmployeeSearchSelectProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [keyword, setKeyword] = useState(value || '');
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setKeyword(value || '');
  }, [value]);

  useEffect(() => {
    setLoading(true);
    setError('');

    getEmployeeList()
      .then(setEmployees)
      .catch((err) => {
        setError(err instanceof Error ? err.message : '社員一覧の取得に失敗しました。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    if (!lowerKeyword) {
      return employees;
    }

    return employees.filter((employee) => {
      return getEmployeeSearchText(employee).includes(lowerKeyword);
    });
  }, [employees, keyword]);

  const visibleEmployees = filteredEmployees.slice(0, 30);

  function handleKeywordChange(nextKeyword: string) {
    setKeyword(nextKeyword);
    setOpen(true);

    // Manual typing allowed.
    onChange(null, nextKeyword);
  }

  function handleSelect(employee: Employee) {
    const displayName = getEmployeeLabel(employee);

    setKeyword(displayName);
    setOpen(false);

    onChange(employee, displayName);
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <input
        value={keyword}
        onFocus={() => setOpen(true)}
        onChange={(e) => handleKeywordChange(e.target.value)}
        placeholder="社員番号・名前・ふりがな・英語名で検索"
        disabled={disabled || loading}
        autoComplete="off"
        style={{
          display: 'block',
          padding: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      {open && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            background: '#fff',
            border: '1px solid #ccc',
            maxHeight: '240px',
            overflowY: 'auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          }}
        >
          {loading && (
            <div style={{ padding: '8px', color: '#666' }}>
              社員一覧を読み込み中...
            </div>
          )}

          {error && (
            <div style={{ padding: '8px', color: 'red' }}>
              {error}
            </div>
          )}

          {!loading && !error && visibleEmployees.length === 0 && (
            <div style={{ padding: '8px', color: '#666' }}>
              該当する社員が見つかりません。
            </div>
          )}

          {!loading && !error && visibleEmployees.map((employee, index) => (
            <button
              key={`${employee.employeeNo}-${employee.name}-${index}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(employee);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid #eee',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <div>
                {getEmployeeLabel(employee)}
              </div>

              <div style={{ fontSize: '12px', color: '#666' }}>
                {[
                  employee.employeeNo,
                  employee.status,
                  employee.position,
                  employee.nationality,
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </div>
            </button>
          ))}

          {!loading && !error && filteredEmployees.length > 30 && (
            <div style={{ padding: '8px', color: '#666', fontSize: '12px' }}>
              候補が多すぎます。検索文字を追加してください。
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmployeeSearchSelect;