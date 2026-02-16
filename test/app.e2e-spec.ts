import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from './../src/user/user.entity';
import { UserRoles } from './../src/shared/roles.enum';

describe('App (e2e)', () => {
  let app: INestApplication;

  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let adminId: string;
  let customerId: string;

  const admin = { email: 'admin@test.com', password: 'pass123', name: 'Admin' };
  const editor = {
    email: 'editor@test.com',
    password: 'pass123',
    name: 'Editor',
  };
  const viewer = {
    email: 'viewer@test.com',
    password: 'pass123',
    name: 'Viewer',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Clean up test users from any previous run
    const userRepo = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await userRepo.delete({ email: admin.email });
    await userRepo.delete({ email: editor.email });
    await userRepo.delete({ email: viewer.email });

    // Register all three users
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(admin);
    const editorRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(editor);
    const viewerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(viewer);

    adminId = adminRes.body.user.userId;
    const editorId = editorRes.body.user.userId;
    viewerToken = viewerRes.body.token;

    // Promote admin and editor directly via repository (all users default to VIEWER)
    await userRepo.update({ userId: adminId }, { role: UserRoles.ADMIN });
    await userRepo.update({ userId: editorId }, { role: UserRoles.EDITOR });

    // Re-login to get tokens with the updated roles in the JWT payload
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: admin.email, password: admin.password });
    adminToken = adminLoginRes.body.token;

    const editorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: editor.email, password: editor.password });
    editorToken = editorLoginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('returns a token on success', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'new@test.com', password: 'pass123', name: 'New' });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'pass123', name: 'No Email' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'short@test.com', password: '123', name: 'Short' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns a token with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: admin.email, password: admin.password });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('returns 401 with wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: admin.email, password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 with a valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(res.status).toBe(201);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  // ── Role update ───────────────────────────────────────────────────────────

  describe('PATCH /auth/:id/role', () => {
    it('allows admin to update a role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/auth/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'editor' });
      expect([200, 201]).toContain(res.status);
    });

    it('returns 403 when called by a non-admin', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/auth/${adminId}/role`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ role: 'editor' });
      expect(res.status).toBe(403);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/auth/${adminId}/role`)
        .send({ role: 'editor' });
      expect(res.status).toBe(401);
    });
  });

  // ── Customers ─────────────────────────────────────────────────────────────

  describe('POST /customers', () => {
    it('allows editor to create a customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Acme Corp', email: 'acme@corp.com' });
      expect([200, 201]).toContain(res.status);
      customerId = res.body.id;
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'No Auth', email: 'no@auth.com' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /customers', () => {
    it('returns customers for an authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${editorToken}`);
      expect([200, 201]).toContain(res.status);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer()).get('/customers');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /customers/:id', () => {
    it('allows editor to update their own customer', async () => {
      if (!customerId) return;
      const res = await request(app.getHttpServer())
        .put(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Acme Updated' });
      expect([200, 201]).toContain(res.status);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer())
        .put(`/customers/some-id`)
        .send({ name: 'Hack' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('allows editor to delete their own customer', async () => {
      if (!customerId) return;
      const res = await request(app.getHttpServer())
        .delete(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${editorToken}`);
      expect([200, 201]).toContain(res.status);
    });

    it('returns 401 without a token', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/customers/some-id`,
      );
      expect(res.status).toBe(401);
    });
  });
});
