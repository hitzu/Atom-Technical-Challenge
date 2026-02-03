import admin from 'firebase-admin';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import { waitForFirestoreEmulator, wipeFirestore } from './helpers/firestore';

// Make local runs "just work" when running `npm test` from `back/`.
// You can still override these from the shell or CI.
process.env.FIREBASE_PROJECT_ID ??= 'demo-project';
process.env.GCLOUD_PROJECT ??= process.env.FIREBASE_PROJECT_ID;
process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';

beforeAll(async () => {
  await waitForFirestoreEmulator({ timeoutMs: 20_000 });
});

beforeEach(async () => {
  // Global reset for full isolation.
  await wipeFirestore();
});

afterAll(async () => {
  // Avoid open handles between Vitest runs.
  await Promise.all(admin.apps.map((app) => app?.delete().catch(() => undefined)));
});

