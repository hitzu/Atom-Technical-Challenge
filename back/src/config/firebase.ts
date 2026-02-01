import admin from 'firebase-admin';

import { getEnvConfig } from './env';

export function getFirestore(): FirebaseFirestore.Firestore {
  const config = getEnvConfig();

  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: config.firebaseProjectId,
    });
  }

  return admin.firestore();
}

