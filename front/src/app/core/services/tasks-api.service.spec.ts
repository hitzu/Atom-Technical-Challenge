import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TasksApiService } from './tasks-api.service';

describe('TasksApiService', () => {
  let service: TasksApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(TasksApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('builds querystring for list() and returns response data', async () => {
    const promise = service.list({ status: 'PENDING', sort: 'asc' });

    const req = httpMock.expectOne('http://localhost:4000/api/tasks?status=PENDING&sort=asc');
    expect(req.request.method).toBe('GET');

    req.flush({
      data: [
        {
          id: 't1',
          userId: 'u1',
          title: 'Task 1',
          description: 'Desc',
          createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
          completed: false,
        },
      ],
    });

    const tasks = await promise;
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('t1');
  });

  it('URL-encodes the id on update()', async () => {
    const promise = service.update('a/b', { completed: true });

    const req = httpMock.expectOne('http://localhost:4000/api/tasks/a%2Fb');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });

    req.flush({
      data: {
        id: 'a/b',
        userId: 'u1',
        title: 'Task',
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        completed: true,
      },
    });

    const task = await promise;
    expect(task.completed).toBeTrue();
  });
});

