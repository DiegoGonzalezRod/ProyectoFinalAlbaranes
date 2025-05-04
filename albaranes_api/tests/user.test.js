require('dotenv').config({ path: '.env.test' }); // Siempre primero
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');

const testEmail = `test${Date.now()}@mail.com`;
const testPassword = 'Test123456!';
let token = '';
let userId = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'TestUser',
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
  await User.deleteMany({ email: testEmail });
  await mongoose.connection.close();
});

describe('Endpoints de usuario completos', () => {
  test('Debe logear correctamente y devolver token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Debe completar datos personales del usuario', async () => {
    const res = await request(app)
      .patch('/api/users/onboardingUser')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Diego',
        apellidos: 'Gonzalez',
        nif: '12345678Z',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('Debe completar datos de empresa del usuario', async () => {
    const res = await request(app)
      .patch('/api/users/onboardingCompany')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Munich-RE',
        cif: 'B12345678',
        address: 'Calle Empresa 1, Madrid',
        phone: '912345678',
        isFreelance: false,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('Debe recuperar los datos del usuario', async () => {
    const res = await request(app)
      .get('/api/users/getUser')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('email', testEmail);
  });

  test('Debe cambiar la contraseña (recuperar)', async () => {
    const res = await request(app)
      .put('/api/users/recover-password')
      .send({
        email: testEmail,
        newPassword: 'NuevaPass123!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('Debe eliminar el usuario', async () => {
    const res = await request(app)
      .delete('/api/users/deleteUser')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Validaciones de errores y seguridad', () => {
  test('Debe fallar el registro sin contraseña', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'UsuarioError',
        code: '654321',
        email: `fail${Date.now()}@mail.com`,
        // falta password
      });

    expect([422, 403]).toContain(res.statusCode); // depende de cómo lo manejes
    expect(typeof res.body).toBe('object');
  });

  test('Debe fallar el login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testEmail,
        password: 'ContraseñaIncorrecta',
      });

    expect([401, 403]).toContain(res.statusCode);
    expect(typeof res.body).toBe('object');
  });

  test('Debe denegar acceso a datos del usuario sin token', async () => {
    const res = await request(app).get('/api/users/getUser');

    expect(res.statusCode).toBe(401);
    expect(typeof res.body).toBe('object');
  });

  test('Debe denegar modificación de datos sin token', async () => {
    const res = await request(app)
      .patch('/api/users/onboardingUser')
      .send({
        name: 'Intruso',
        apellidos: 'NoPermitido',
        nif: '99999999Z',
      });

    expect(res.statusCode).toBe(401);
    expect(typeof res.body).toBe('object');
  });
});
