const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../src/app');
const { ensureDefaultAdmin, resetMemoryStore } = require('../src/services/store');

test.beforeEach(async () => {
  resetMemoryStore();
  await ensureDefaultAdmin('admin@primetrade.ai', 'Admin@12345');
});

test('register, login, and task CRUD flow for normal user', async () => {
  const registerRes = await request(app).post('/api/v1/auth/register').send({
    name: 'John User',
    email: 'john@example.com',
    password: 'Password123'
  });
  assert.equal(registerRes.statusCode, 201);

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'john@example.com',
    password: 'Password123'
  });
  assert.equal(loginRes.statusCode, 200);
  assert.ok(loginRes.body.token);

  const token = loginRes.body.token;

  const createRes = await request(app)
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Read API docs', description: 'Open /api-docs and inspect routes' });
  assert.equal(createRes.statusCode, 201);
  assert.equal(createRes.body.title, 'Read API docs');

  const listRes = await request(app).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
  assert.equal(listRes.statusCode, 200);
  assert.equal(listRes.body.length, 1);

  const updateRes = await request(app)
    .put(`/api/v1/tasks/${createRes.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ completed: true });
  assert.equal(updateRes.statusCode, 200);
  assert.equal(updateRes.body.completed, true);

  const deleteRes = await request(app)
    .delete(`/api/v1/tasks/${createRes.body.id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(deleteRes.statusCode, 204);
});

test('admin can see all user tasks', async () => {
  await request(app).post('/api/v1/auth/register').send({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'Password123'
  });

  const userLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'alice@example.com',
    password: 'Password123'
  });

  await request(app)
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userLogin.body.token}`)
    .send({ title: 'User Task' });

  const adminLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@primetrade.ai',
    password: 'Admin@12345'
  });

  const listRes = await request(app)
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${adminLogin.body.token}`);

  assert.equal(listRes.statusCode, 200);
  assert.equal(listRes.body.length, 1);

  const adminUsersRes = await request(app)
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${adminLogin.body.token}`);
  assert.equal(adminUsersRes.statusCode, 200);
  assert.equal(adminUsersRes.body.some((user) => user.email === 'alice@example.com'), true);

  const userUsersRes = await request(app)
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${userLogin.body.token}`);
  assert.equal(userUsersRes.statusCode, 403);
});
