const express = require("express");
const { createItem, userLogin, updateUserPersonalData, updateUserCompanyData, getUser, deleteUser, recoverPassword, validateEmailCode } = require('../controllers/users');
const { validatorCreateItem, validatorGetItem, validateRecoverPassword, validatorVerifyCode, validatorUpdateUserPersonalData, validateCompanyData } = require("../validators/user");
const authMiddleware = require('../middleware/session');

const userRouter = express.Router();


/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           example: test@email.com
 *         password:
 *           type: string
 *           example: Test1234!
 *         name:
 *           type: string
 *           example: Diego
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     ValidationCode:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           example: 123456
 *     PersonalData:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         apellidos:
 *           type: string
 *         nif:
 *           type: string
 *     CompanyData:
 *       type: object
 *       properties:
 *         companyName:
 *           type: string
 *         cif:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *     RecoverPassword:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 */

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 */
userRouter.post('/register', validatorCreateItem, createItem);

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 */
userRouter.post('/login', validatorGetItem, userLogin);

/**
 * @openapi
 * /user/validation:
 *   post:
 *     summary: Validación del código enviado por correo
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationCode'
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 */
userRouter.post('/validation', authMiddleware, validatorVerifyCode, validateEmailCode);

/**
 * @openapi
 * /user/onboardingUser:
 *   patch:
 *     summary: Completar datos personales del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonalData'
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 */
userRouter.patch('/onboardingUser', authMiddleware, validatorUpdateUserPersonalData, updateUserPersonalData);

/**
 * @openapi
 * /user/onboardingCompany:
 *   patch:
 *     summary: Completar datos de empresa del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyData'
 *     responses:
 *       200:
 *         description: Datos de empresa actualizados
 */
userRouter.patch('/onboardingCompany', authMiddleware, validateCompanyData, updateUserCompanyData);

/**
 * @openapi
 * /user/getUser:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 */
userRouter.get('/getUser', authMiddleware, getUser);

/**
 * @openapi
 * /user/deleteUser:
 *   delete:
 *     summary: Eliminar usuario autenticado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
userRouter.delete('/deleteUser', authMiddleware, deleteUser);

/**
 * @openapi
 * /user/recover-password:
 *   put:
 *     summary: Enviar correo de recuperación de contraseña
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecoverPassword'
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 */
userRouter.put("/recover-password", validateRecoverPassword, recoverPassword);

module.exports = userRouter;
