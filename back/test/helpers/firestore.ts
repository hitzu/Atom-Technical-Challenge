function getProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT ?? 'demo-project';
}

function getEmulatorHost(): string {
  return process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
}

function getEmulatorBaseUrl(): string {
  const host = getEmulatorHost();
  // Host never includes protocol; we always assume HTTP for the emulator.
  return `http://${host}`;
}

export async function waitForFirestoreEmulator(opts?: { timeoutMs?: number }): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? 15_000;
  const startedAt = Date.now();
  const baseUrl = getEmulatorBaseUrl();
  const projectId = getProjectId();

  const url = `${baseUrl}/emulator/v1/projects/${projectId}/databases/(default)/documents`;

  // Keep polling until it responds (any HTTP status means it's reachable).
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await fetch(url, { method: 'GET' });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  throw new Error(
    [
      'Firestore Emulator is not reachable.',
      `Tried: ${url}`,
      `FIRESTORE_EMULATOR_HOST=${getEmulatorHost()}`,
      `FIREBASE_PROJECT_ID=${projectId}`,
    ].join(' '),
  );
}

export async function wipeFirestore(): Promise<void> {
  const baseUrl = getEmulatorBaseUrl();
  const projectId = getProjectId();

  // This endpoint clears the entire database for the specified project (emulator only).
  const url = `${baseUrl}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const res = await fetch(url, { method: 'DELETE' });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to wipe Firestore Emulator (HTTP ${res.status}). ${body}`.trim());
  }
}

