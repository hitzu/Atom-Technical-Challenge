import { TaskSchema, UpdateTaskInputSchema } from '@atom/shared';
import type { Task, UpdateTaskInput, ListTasksQuery } from '@atom/shared';
import type { Firestore } from 'firebase-admin/firestore';

import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import { AppError } from '../../api/errors/AppError';

export class FirestoreTaskRepository implements TaskRepository {
  private readonly tasksCollection: FirebaseFirestore.CollectionReference;

  public constructor(private readonly firestore: Firestore) {
    this.tasksCollection = this.firestore.collection('tasks');
  }

  public async listByUserId(userId: string, query: ListTasksQuery): Promise<Task[]> {
    const { status, sort } = query;

    const snapshot = await this.tasksCollection.where('userId', '==', userId).orderBy('createdAt', sort ?? 'asc').get();
    let tasks = snapshot.docs.map((doc) => TaskSchema.parse({ id: doc.id, ...doc.data() }));
    if (status === 'PENDING') {
      tasks = tasks.filter((task) => task.completed == false);
    }

    return tasks;

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
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
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
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }
    return TaskSchema.parse({ id: snapshot.id, ...snapshot.data() });
  }
}

