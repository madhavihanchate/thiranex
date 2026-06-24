import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

function extractCookie(res: any, name: string): string | undefined {
  const raw = res.headers['set-cookie'];
  if (!raw) return undefined;
  const cookies = Array.isArray(raw) ? raw : [raw];
  return cookies.find((c: string) => c.startsWith(`${name}=`));
}

describe('Auth API', () => {
  const testUser = { email: 'authtest@example.com', password: 'testpassword123' };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.password_hash).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(true);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'notanemail', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'short@test.com', password: '1234' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);

      const cookie = extractCookie(res, 'refreshToken');
      expect(cookie).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should reject nonexistent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh with valid cookie', async () => {
      // Login to get a fresh cookie
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      const cookie = extractCookie(loginRes, 'refreshToken');
      expect(cookie).toBeDefined();

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie!);

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject without cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Register a dedicated user for this test to avoid any state issues
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'logout@test.com', password: 'password123' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'logout@test.com', password: 'password123' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken;
      expect(token).toBeDefined();

      const cookie = extractCookie(loginRes, 'refreshToken');
      // If cookie is present, include it; otherwise just test auth logout
      const logoutReq = request(app)
        .delete('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      if (cookie) {
        logoutReq.set('Cookie', cookie);
      }

      const res = await logoutReq;
      expect(res.status).toBe(204);
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .delete('/api/auth/logout');

      expect(res.status).toBe(401);
    });
  });
});
