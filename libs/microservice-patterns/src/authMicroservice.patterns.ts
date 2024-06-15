export enum AuthMicroservicePatterns {
  GOOGLE_AUTH = 'google-auth',
  GITHUB_AUTH = 'github-auth',
  USER_REGISTER = 'register',
  USER_LOGIN = 'login',
  USER_LOGOUT = 'logout',
  REGISTER_CODE_CHECK = 'register-code-check',
  RESEND_REGISTER_EMAIL = 'resend-register-email',
  UPDATE_TOKENS_PAIR = 'update-tokens-pair',
  CREATE_PASSWORD_RECOVERY_REQUEST = 'password-recovery-request',
  PASSWORD_RECOVERY_CODE_CHECK = 'password-recovery-code-check',
  PASSWORD_RECOVERY = 'password-recovery',
}
