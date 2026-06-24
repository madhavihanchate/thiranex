import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Tasks API', () => {
  let accessToken: string;
  let accessToken2: string;
  let taskId: string;

  beforeAll(async () => {
    // Register & login user 1
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'tasks1@test.com', password: 'password123' });

    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tasks1@test.com', password: 'password123' });
    accessToken = login1.body.accessToken;

    // Register & login user 2
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'tasks2@test.com', password: 'password123' });

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tasks2@test.com', password: 'password123' });
    accessToken2 = login2.body.accessToken;
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Task',
          description: 'A test task description',
          priority: 'high',
          due_date: '2026-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Task');
      expect(res.body.priority).toBe('high');
      expect(res.body.status).toBe('todo');
      expect(res.body.id).toBeDefined();
      taskId = res.body.id;
    });

    it('should reject missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthorized' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeAll(async () => {
      // Create additional tasks
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: `Task ${i + 2}`,
            status: ['todo', 'in_progress', 'done'][i],
            priority: ['low', 'medium', 'high'][i],
          });
      }
    });

    it('should return paginated tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(4);
      expect(res.body.page).toBe(1);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((task: any) => {
        expect(task.status).toBe('todo');
      });
    });

    it('should filter by priority', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((task: any) => {
        expect(task.priority).toBe('high');
      });
    });

    it('should respect pagination', async () => {
      const res = await request(app)
        .get('/api/tasks?limit=2&page=1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.limit).toBe(2);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a single task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(taskId);
      expect(res.body.title).toBe('Test Task');
    });

    it('should return 404 for nonexistent task', async () => {
      const res = await request(app)
        .get('/api/tasks/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should not allow user2 to see user1 tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task fields', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Task', status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Task');
      expect(res.body.status).toBe('in_progress');
    });

    it('should not allow user2 to update user1 tasks', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should soft delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });

    it('should not return deleted task in list', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should restore a deleted task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/restore`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(taskId);
      expect(res.body.deleted_at).toBeNull();
    });
  });
});
