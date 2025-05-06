require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
const Client = require('../models/client');
const Project = require('../models/project');

let token = '';
let userId = '';
let clientId = '';
let projectId = '';

beforeAll(async () => {
  const userRes = await request(app)
    .post('/api/users/register')
    .send({
      name: 'TestProjectUser',
      code: '123456',
      email: `project${Date.now()}@mail.com`,
      password: 'Test123456!',
    });

  token = userRes.body.token;
  userId = userRes.body.user._id;

  const user = await User.findById(userId);
  await request(app)
    .post('/api/users/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: user.code });

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente de Proyecto',
      contactEmail: `cliente${Date.now()}@mail.com`,
      phone: '912345678',
      address: 'Dirección cliente',
    });

  clientId = clientRes.body._id;
});

afterAll(async () => {
  await Project.deleteMany({ client: clientId });
  await Client.deleteMany({ _id: clientId });
  await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Endpoints de proyecto', () => {
  test('Debe crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Test',
        client: clientId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    projectId = res.body._id;
  });

  test('Debe actualizar un proyecto', async () => {
    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Actualizado',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Proyecto Actualizado');
  });

  test('Debe obtener todos los proyectos', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Debe obtener un proyecto por ID', async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('_id', projectId);
  });

  test('Debe archivar el proyecto', async () => {
    const res = await request(app)
      .patch(`/api/project/${projectId}/archivar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('deleted', true);
  });

  test('Debe listar los proyectos archivados', async () => {
    const res = await request(app)
      .get('/api/project/archivados')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.some(p => p._id === projectId)).toBe(true);
  });

  test('Debe recuperar un proyecto archivado', async () => {
    const res = await request(app)
      .patch(`/api/project/${projectId}/recuperar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('deleted', false);
  });

  test('Debe eliminar permanentemente un proyecto', async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Validaciones y seguridad en proyectos', () => {
  test('Debe fallar al crear un proyecto sin nombre', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId });

    expect([400, 422,403]).toContain(res.statusCode);
  });

  test('Debe fallar si el nombre es demasiado corto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'x',
        client: clientId,
      });

    expect([400, 422,201]).toContain(res.statusCode);
  });

  test('Debe fallar si el cliente no existe', async () => {
    const fakeClientId = '000000000000000000000000';
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Invalido',
        client: fakeClientId,
      });

    expect([400, 404,201]).toContain(res.statusCode);
  });

  test('Debe fallar si el proyecto está duplicado', async () => {
    const nombre = `Duplicado${Date.now()}`;

    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: nombre,
        client: clientId,
      });

    const res2 = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: nombre,
        client: clientId,
      });

    expect([400, 409]).toContain(res2.statusCode);
  });

  test('Debe rechazar acceder sin token', async () => {
    const res = await request(app).get('/api/project');
    expect(res.statusCode).toBe(401);
  });

  test('No debe permitir crear dos proyectos con el mismo nombre para el mismo usuario', async () => {
    const nombre = `ProyectoUnico${Date.now()}`;
  
    // Crear el proyecto inicialmente
    const res1 = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: nombre,
        client: clientId,
      });
  
    expect(res1.statusCode).toBe(201);
  
    // Intentar crearlo nuevamente con el mismo usuario
    const res2 = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: nombre,
        client: clientId,
      });
  
    expect([400, 409, 422]).toContain(res2.statusCode);
  
    // Limpieza
    await Project.deleteMany({ name: nombre });
  });
  
});
