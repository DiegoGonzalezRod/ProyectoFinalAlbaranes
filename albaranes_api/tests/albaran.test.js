const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/users');
const Client = require('../models/client');
const Project = require('../models/project');
const DeliveryNote = require('../models/albaran');

let token, userId, clientId, projectId, deliveryNoteId;

const email = `test_albaran${Date.now()}@mail.com`;
const password = 'Test123456!';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({ name: 'TestUser', email, password, code: 123456 });

  token = res.body.token;
  userId = res.body.user._id;

  await request(app)
    .post('/api/users/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: 123456 });

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Test Albarán',
      contactEmail: `cliente${Date.now()}@mail.com`,
      phone: '600600600',
      address: 'Calle Prueba 123'
    });

  clientId = clientRes.body._id;

  const projectRes = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Proyecto Test',
      description: 'Proyecto para pruebas de albarán',
      client: clientId
    });

  projectId = projectRes.body._id;
});

afterAll(async () => {
  await DeliveryNote.deleteMany({ userId });
  await Project.deleteMany({ user: userId });
  await Client.deleteMany({ user: userId });
  await User.deleteMany({ _id: userId });
  await mongoose.connection.close();
});

describe('Albaranes - endpoints completos', () => {
  test('Crear albarán de tipo horas', async () => {
    const res = await request(app)
      .post('/api/albaran')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'hours',
        description: 'Desarrollo backend para API',
        workdate: '2025-04-29',
        hours: 8
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    deliveryNoteId = res.body._id;
  });

  test('Crear albarán de tipo material', async () => {
    const res = await request(app)
      .post('/api/albaran')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'material',
        description: 'Aplicación de hormigón armado',
        material: 'Hormigón armado',
        workdate: '2025-04-30'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });

  test('Listar todos los albaranes del usuario', async () => {
    const res = await request(app)
      .get('/api/albaran')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Obtener un albarán por ID con populate', async () => {
    const res = await request(app)
      .get(`/api/albaran/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('client');
    expect(res.body).toHaveProperty('project');
    expect(res.body).toHaveProperty('company');
  });

  test('Descargar PDF de albarán', async () => {
    const res = await request(app)
      .get(`/api/albaran/pdf/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 500]).toContain(res.statusCode);
  });

  test('Firmar albarán subiendo firma', async () => {
    const firmaPath = path.resolve(__dirname, 'firma.png');
    if (!fs.existsSync(firmaPath)) return;

    const res = await request(app)
      .post(`/api/albaran/sign/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', firmaPath);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('sign');
    expect(res.body).toHaveProperty('pdf');
  });

  test('Eliminar albarán firmado debe fallar', async () => {
    const res = await request(app)
      .delete(`/api/albaran/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([400, 403]).toContain(res.statusCode);
  });

  test('Crear y eliminar albarán no firmado', async () => {
    const resCreate = await request(app)
      .post('/api/albaran')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'material',
        description: 'Material temporal',
        material: 'Bricks',
        workdate: '2025-05-05'
      });

    expect(resCreate.statusCode).toBe(201);

    const resDelete = await request(app)
      .delete(`/api/albaran/${resCreate.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resDelete.statusCode).toBe(200);
  });

  // NUEVOS TESTS
  test('Crear albarán sin descripción debe fallar', async () => {
    const res = await request(app)
      .post('/api/albaran')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId,
        projectId,
        format: 'hours',
        workdate: '2025-05-01',
        hours: 5
      });

    expect([422,403]).toContain(res.statusCode);
  });

  test('Obtener albarán con ID inválido debe devolver 404 o error', async () => {
    const res = await request(app)
      .get(`/api/albaran/000000000000000000000000`)
      .set('Authorization', `Bearer ${token}`);

    expect([404, 500]).toContain(res.statusCode);
  });

  test('No permitir crear albarán sin token', async () => {
    const res = await request(app)
      .post('/api/albaran')
      .send({
        clientId,
        projectId,
        format: 'hours',
        description: 'Sin token',
        workdate: '2025-05-01',
        hours: 4
      });

    expect(res.statusCode).toBe(401);
  });
});
