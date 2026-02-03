export interface EnvConfig {
  port: number;
  firebaseProjectId: string;
  jwtSecret: string;
  allowInsecureHeaderAuth: boolean;
  corsOrigins: string[];
}

function _readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function _readCorsOrigins(): string[] {
  const raw = (process.env.CORS_ORIGINS ?? '').trim();
  if (!raw) {
    // Defaults cover local dev (Angular) and container-based Nginx (if used).
    return ['http://localhost:4200', 'http://localhost:4173'];
  }

  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : ['http://localhost:4200', 'http://localhost:4173'];
}

export function getEnvConfig(): EnvConfig {
  const port = Number(process.env.PORT ?? '4000');
  if (!Number.isFinite(port)) {
    throw new Error('PORT must be a number');
  }

  return {
    port,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT ?? 'demo-project',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
    allowInsecureHeaderAuth: (process.env.ALLOW_INSECURE_HEADER_AUTH ?? 'false') === 'true',
    corsOrigins: _readCorsOrigins(),
  };
}

