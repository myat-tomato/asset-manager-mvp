import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getAuthUser, verifyGoogleLogin } from '../services/authService';

function waitForGoogleScript() {
  return new Promise<NonNullable<typeof window.google>>((resolve, reject) => {
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(timer);
        resolve(window.google);
        return;
      }

      if (Date.now() - startedAt > 5000) {
        window.clearInterval(timer);
        reject(new Error('Googleログインライブラリを読み込めませんでした。'));
      }
    }, 100);
  });
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingUser = getAuthUser();

    const state = location.state as {
      from?: {
        pathname?: string;
        search?: string;
      };
    } | null;

    const redirectPath = `${state?.from?.pathname || '/'}${state?.from?.search || ''}`;

    if (existingUser) {
      navigate(redirectPath, { replace: true });
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    if (!buttonRef.current) {
      return;
    }

    waitForGoogleScript()
      .then((google) => {
        if (!buttonRef.current) {
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Googleログイン情報を取得できませんでした。');
              return;
            }

            setLoading(true);
            setError('');

            try {
              await verifyGoogleLogin(response.credential);
              navigate(redirectPath, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'ログインに失敗しました。');
            } finally {
              setLoading(false);
            }
          },
        });

        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Googleログインの初期化に失敗しました。');
      });
  }, [location.state, navigate]);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Asset Manager MVP</h1>

      <p>Googleアカウントでログインしてください。</p>

      {error && (
        <p style={{ color: 'red' }}>
          エラー: {error}
        </p>
      )}

      {loading && <p>ログイン確認中...</p>}

      <div ref={buttonRef} />
    </div>
  );
}

export default LoginPage;