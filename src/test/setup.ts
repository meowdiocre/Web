import '@testing-library/jest-dom/vitest';

// Tests should never reach a real DB. If a test does need one it can
// override these locally with vi.stubEnv(...).
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/test';
process.env.SESSION_SECRET ??= 'test-session-secret-test-session-secret-test-session-secret-test-session-secret';
process.env.ADMIN_GITHUB_LOGIN ??= 'devirtz';
process.env.GITHUB_CLIENT_ID ??= 'test-client-id';
process.env.GITHUB_CLIENT_SECRET ??= 'test-client-secret';
process.env.CRON_SECRET ??= 'test-cron-secret';
process.env.PUBLIC_SITE_URL ??= 'http://localhost:5173';
