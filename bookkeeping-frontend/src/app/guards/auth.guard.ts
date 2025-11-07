import { createAuthGuard } from '@shared-components/auth';

export const authGuard = createAuthGuard({
  tokenKey: 'authToken',
  redirectTo: '/login',
  rememberAttemptedUrl: false
});

