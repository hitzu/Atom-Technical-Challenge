import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/main';

describe('GET /health', () => {
  it('should return ok=true', async () => {
    // Arrange
    const app = createApp();

    // Act
    const res = await request(app).get('/health');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

