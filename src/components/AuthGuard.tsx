import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { getAuthUser } from '../services/authService';

type AuthGuardProps = {
  children: ReactNode;
};

function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const user = getAuthUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <>{children}</>;
}

export default AuthGuard;