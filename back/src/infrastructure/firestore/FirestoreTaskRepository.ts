import { TaskSchema, UpdateTaskInputSchema } from '@atom/shared';
import type { Task, UpdateTaskInput } from '@atom/shared';
import type { Firestore } from 'firebase-admin/firestore';

import type { TaskRepository } from '../../domain/repositories/TaskRepository';

export class FirestoreTaskRepository implements TaskRepository {
  private readonly tasksCollection: FirebaseFirestore.CollectionReference;

  public constructor(private readonly firestore: Firestore) {
    this.tasksCollection = this.firestore.collection('tasks');
  }

  public async listByUserId(userId: string): Promise<Task[]> {
    const snapshot = await this.tasksCollection.where('userId', '==', userId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map((doc) => TaskSchema.parse({ id: doc.id, ...doc.data() }));
  }

  public async create(userId: string, input: { title: string; description?: string }): Promise<Task> {
    const nowIso = new Date().toISOString();
    const docRef = this.tasksCollection.doc();

    const task: Task = TaskSchema.parse({
      id: docRef.id,
      userId,
      title: input.title,
      description: input.description,
      createdAt: nowIso,
      completed: false,
    });

    await docRef.set({
      userId: task.userId,
      title: task.title,
      description: task.description,
      createdAt: task.createdAt,
      completed: task.completed,
    });

    return task;
  }

  public async update(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const safeInput = UpdateTaskInputSchema.parse(input);
    const docRef = this.tasksCollection.doc(taskId);
    const existing = await docRef.get();
    if (!existing.exists) {
      throw new Error('Task not found');
    }

    await docRef.update(safeInput);
    const updated = await docRef.get();
    return TaskSchema.parse({ id: updated.id, ...updated.data() });
  }

  public async delete(taskId: string): Promise<void> {
    await this.tasksCollection.doc(taskId).delete();
  }

  public async getById(taskId: string): Promise<Task> {
    const snapshot = await this.tasksCollection.doc(taskId).get();
    if (!snapshot.exists) {
      throw new Error('Task not found');
    }
    return TaskSchema.parse({ id: snapshot.id, ...snapshot.data() });
  }
}

