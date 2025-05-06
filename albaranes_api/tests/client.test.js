require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
const Client = require('../models/client');

const testEmail = `client${Date.now()}@mail.com`;
const testPassword = 'Test123456!';
let token = '';
let userId = '';
let clientId = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'ClientTester',
      code: '123456',
      email: testEmail,
      password: testPassword,
    });

  token = res.body.token;
  userId = res.body.user._id;

  const user = await User.findById(userId);
  await request(app)
    .post('/api/users/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: user.code });
});

afterAll(async () => {
  await Client.deleteMany({ user: userId });
  await User.deleteMany({ email: testEmail });
  await mongoose.connection.close();
});

describe('Endpoints de cliente', () => {
  test('Debe crear un cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente S.A.',
        contactEmail: 'cliente@test.com',
        phone: '912345678',
        address: 'Calle Falsa 123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    clientId = res.body._id;
  });

  test('Debe obtener todos los clientes del usuario', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Debe obtener un cliente por ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('_id', clientId);
  });

  test('Debe actualizar un cliente', async () => {
    const res = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Actualizado',
        contactEmail: 'actualizado@cliente.com',
        phone: '600000000',
        address: 'Calle Actualizada 456',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Cliente Actualizado');
  });

  test('Debe archivar el cliente', async () => {
    const res = await request(app)
      .patch(`/api/client/${clientId}/archivar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('deleted', true);
  });

  test('Debe listar los clientes archivados', async () => {
    const res = await request(app)
      .get('/api/client/archivados')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.some(client => client._id === clientId)).toBe(true);
  });

  test('Debe recuperar el cliente archivado', async () => {
    const res = await request(app)
      .patch(`/api/client/${clientId}/recuperar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('deleted', false);
  });

  test('Debe eliminar permanentemente un cliente', async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Validaciones de cliente', () => {
  test('No debe permitir crear dos clientes con el mismo email para el mismo usuario', async () => {
    const duplicateEmail = `duplicado${Date.now()}@cliente.com`;

    const res1 = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Original',
        contactEmail: duplicateEmail,
        phone: '900111222',
        address: 'Calle Única 1',
      });

    expect(res1.statusCode).toBe(201);

    const res2 = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Duplicado',
        contactEmail: duplicateEmail,
        phone: '900333444',
        address: 'Calle Otra 2',
      });

    expect([400, 409, 422]).toContain(res2.statusCode);
  });
  test('No debe permitir crear dos clientes con el mismo email para la misma compañía', async () => {
    const duplicateEmail = `duplicado${Date.now()}@empresa.com`;
  
    // Crear segundo usuario con misma compañía
    const resUser2 = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Usuario2',
        email: `user2_${Date.now()}@mail.com`,
        password: 'Test123456!',
        code: '123456'
      });
  
    const token2 = resUser2.body.token;
    const user2Id = resUser2.body.user._id;
  
    // Validar segundo usuario
    await request(app)
      .post('/api/users/validation')
      .set('Authorization', `Bearer ${token2}`)
      .send({ code: '123456' });
  
    // Crear cliente desde el primer usuario
    const res1 = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Común',
        contactEmail: duplicateEmail,
        phone: '600600600',
        address: 'Calle Uno'
      });
  
    expect(res1.statusCode).toBe(201);
  
    // Intentar crear cliente con el mismo email desde segundo usuario (misma compañía)
    const res2 = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        name: 'Cliente Duplicado',
        contactEmail: duplicateEmail,
        phone: '600600601',
        address: 'Calle Dos'
      });
  
    expect([400, 409, 422]).toContain(res2.statusCode);
  
    // Limpieza
    await Client.deleteMany({ contactEmail: duplicateEmail });
    await User.deleteOne({ _id: user2Id });
  });
  
  

  test('Debe fallar al actualizar cliente con email inválido', async () => {
    const nuevo = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Email Malo',
        contactEmail: `test${Date.now()}@cliente.com`,
        phone: '600000000',
        address: 'Dirección',
      });

    const res = await request(app)
      .put(`/api/client/${nuevo.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        contactEmail: 'no-es-email',
        name: 'Cualquiera',
        phone: '600000000',
        address: 'Dirección',
      });

    expect([400, 422,403]).toContain(res.statusCode);
  });

  test('Debe fallar al eliminar un cliente ya eliminado', async () => {
    const nuevo = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Borrar',
        contactEmail: `delete${Date.now()}@cliente.com`,
        phone: '600000001',
        address: 'Borrar dirección',
      });

    await request(app)
      .delete(`/api/client/${nuevo.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/client/${nuevo.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect([400, 404]).toContain(res.statusCode);
  });

  test('Debe fallar al recuperar cliente no archivado', async () => {
    const nuevo = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Activo',
        contactEmail: `activo${Date.now()}@cliente.com`,
        phone: '600000002',
        address: 'Activa dirección',
      });

    const res = await request(app)
      .patch(`/api/client/${nuevo.body._id}/recuperar`)
      .set('Authorization', `Bearer ${token}`);

    expect([400, 409, 404]).toContain(res.statusCode);
  });
});

describe('Seguridad de endpoints de cliente (sin token)', () => {
  test('Debe rechazar creación de cliente sin token', async () => {
    const res = await request(app)
      .post('/api/client')
      .send({
        name: 'Sin Token',
        contactEmail: 'sin@token.com',
        phone: '900000000',
        address: 'Calle Insegura 1',
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar obtener todos los clientes sin token', async () => {
    const res = await request(app).get('/api/client');
    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar obtener cliente por ID sin token', async () => {
    const res = await request(app).get('/api/client/123456789012');
    expect([401, 403]).toContain(res.statusCode);
  });

  test('Debe rechazar actualizar cliente sin token', async () => {
    const res = await request(app)
      .put('/api/client/123456789012')
      .send({ name: 'No permitido' });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar archivar cliente sin token', async () => {
    const res = await request(app)
      .patch('/api/client/123456789012/archivar');

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar eliminar cliente sin token', async () => {
    const res = await request(app)
      .delete('/api/client/123456789012');

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar listar archivados sin token', async () => {
    const res = await request(app).get('/api/client/archivados');
    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar recuperar cliente sin token', async () => {
    const res = await request(app)
      .patch('/api/client/123456789012/recuperar');

    expect(res.statusCode).toBe(401);
  });
});
