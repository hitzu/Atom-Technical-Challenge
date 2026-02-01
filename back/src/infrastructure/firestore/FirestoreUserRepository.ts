import { StoredUserSchema } from '@atom/shared';
import type { User } from '@atom/shared';
import type { Firestore } from 'firebase-admin/firestore';

import type { UserRepository } from '../../domain/repositories/UserRepository';

export class FirestoreUserRepository implements UserRepository {
  private readonly usersCollection: FirebaseFirestore.CollectionReference;

  public constructor(private readonly firestore: Firestore) {
    this.usersCollection = this.firestore.collection('users');
  }

  public async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }

    return StoredUserSchema.parse({ id: doc.id, ...doc.data() });
  }

  public async create(userInput: { email: string }): Promise<User> {
    const nowIso = new Date().toISOString();
    const docRef = this.usersCollection.doc();

    const user: User = StoredUserSchema.parse({
      id: docRef.id,
      email: userInput.email,
      createdAt: nowIso,
    });

    await docRef.set({
      email: user.email,
      createdAt: user.createdAt,
    });

    return user;
  }
}

