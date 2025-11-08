export interface LoginConfig {
  appTitle: string;
  githubRepoUrl: string;
  photoUrl?: string;
  demoCredentials?: {
    username: string;
    password: string;
  };
  redirectAfterLogin: string;
  showDeveloperCard?: boolean;
  /** Enable quick demo mode - users can login instantly without entering credentials */
  quickDemoMode?: boolean;
  /** Show production login option (for enterprise users) */
  showProductionLogin?: boolean;
  /** Supported authentication methods for production use */
  authenticationMethods?: Array<'credentials' | 'activeDirectory' | 'google' | 'microsoft' | 'github' | 'saml'>;
}

