export interface BootstrapCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  timestamp?: Date;
  details?: any;
}

export interface BootstrapState {
  isReady: boolean;
  checks: BootstrapCheck[];
  overallStatus: 'initializing' | 'ready' | 'error';
  error?: string;
  developerNotified?: boolean;
}

export interface EmailNotificationConfig {
  /** Whether to send email notifications on bootstrap failures */
  enabled: boolean;
  /** Developer email to notify */
  recipientEmail: string;
  /** Application name for email subject */
  appName: string;
  /** API endpoint for sending emails */
  emailEndpoint?: string;
}

export interface BootstrapConfig {
  /**
   * API base URL (e.g., '/api' or 'http://localhost:3000/api')
   */
  apiUrl: string;
  
  /**
   * Email notification configuration for bootstrap failures
   */
  emailNotification?: EmailNotificationConfig;
  
  /**
   * Request timeout in milliseconds
   */
  timeoutMs?: number;
  
  /**
   * Endpoint to check for API availability (e.g., '/organizations' or '/data/dashboard-data')
   */
  apiEndpoint?: string;
  
  /**
   * Name of the localStorage key for authentication token (e.g., 'authToken' or 'sessionId')
   */
  authTokenKey?: string;
  
  /**
   * Additional critical endpoints to validate (optional)
   */
  criticalEndpoints?: string[];
  
  /**
   * Whether to check database connectivity (default: false)
   */
  checkDatabase?: boolean;
  
  /**
   * Whether to validate existing session token (default: false)
   */
  validateSession?: boolean;
  
  /**
   * Whether to check performance metrics (default: false)
   */
  checkPerformance?: boolean;
  
  /**
   * Performance warning threshold in milliseconds (default: 1000)
   */
  performanceThresholdMs?: number;
  
  /**
   * External integration endpoints to check (optional)
   */
  externalIntegrations?: {
    name: string;
    endpoint: string;
    method?: 'GET' | 'POST';
  }[];
  
  /**
   * Custom error messages
   */
  errorMessages?: {
    backendNotResponding?: string;
    backendHealthFailed?: string;
    apiEndpointsFailed?: string;
    databaseOffline?: string;
    sessionInvalid?: string;
    performanceSlow?: string;
    externalIntegrationFailed?: string;
  };
  
  /**
   * Custom success messages
   */
  successMessages?: {
    backendConnected?: string;
    backendHealthy?: string;
    apiEndpoints?: string;
    authenticated?: string;
    databaseConnected?: string;
    sessionValid?: string;
    performanceGood?: string;
    externalIntegrationOk?: string;
  };
}

