const express = require("express");
const clientRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createClient } = require("../controllers/client");
const{ getClients } = require("../controllers/client");
const { getClientById } = require("../controllers/client");
const { updateClient } = require("../controllers/client");
const { archiveClient } = require("../controllers/client");
const { deleteClient } = require("../controllers/client");
const { getArchivedClients } = require("../controllers/client");
const { recoverClient } = require("../controllers/client");
const { validatorCreateClient } = require("../validators/client");
const { validatorGetClientById } = require("../validators/client");
const {validatorUpdateClient} = require("../validators/client");

clientRouter.post("/", authMiddleware, validatorCreateClient, createClient);
clientRouter.get("/", authMiddleware, getClients);
clientRouter.get("/archivados", authMiddleware, getArchivedClients);
clientRouter.get("/:id", authMiddleware, validatorGetClientById, getClientById);
clientRouter.put("/:id", authMiddleware, validatorUpdateClient, updateClient);
clientRouter.patch("/:id/archivar", authMiddleware,archiveClient);
clientRouter.delete("/:id", authMiddleware,deleteClient);
clientRouter.patch("/:id/recuperar", authMiddleware,recoverClient);


/**
 * @openapi
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - name
 *         - cif
 *         - address
 *         - contactEmail
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: Empresa S.A.
 *         cif:
 *           type: string
 *           example: B12345678
 *         address:
 *           type: string
 *           example: Calle Falsa 123
 *         contactEmail:
 *           type: string
 *           example: contacto@empresa.com
 *         phone:
 *           type: string
 *           example: 912345678
 */

/**
 * @openapi
 * /client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 */
clientRouter.post("/", authMiddleware, validatorCreateClient, createClient);

/**
 * @openapi
 * /client:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida correctamente
 */
clientRouter.get("/", authMiddleware, getClients);

/**
 * @openapi
 * /client/archivados:
 *   get:
 *     summary: Obtener clientes archivados
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
clientRouter.get("/archivados", authMiddleware, getArchivedClients);

/**
 * @openapi
 * /client/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente obtenido correctamente
 *       404:
 *         description: Cliente no encontrado
 */
clientRouter.get("/:id", authMiddleware, validatorGetClientById, getClientById);

/**
 * @openapi
 * /client/{id}:
 *   put:
 *     summary: Actualizar cliente por ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
clientRouter.put("/:id", authMiddleware, validatorUpdateClient, updateClient);

/**
 * @openapi
 * /client/{id}/archivar:
 *   patch:
 *     summary: Archivar cliente por ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente archivado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
clientRouter.patch("/:id/archivar", authMiddleware, archiveClient);

/**
 * @openapi
 * /client/{id}/recuperar:
 *   patch:
 *     summary: Recuperar cliente archivado
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente recuperado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
clientRouter.patch("/:id/recuperar", authMiddleware, recoverClient);

/**
 * @openapi
 * /client/{id}:
 *   delete:
 *     summary: Eliminar cliente por ID
 *     tags: [Client]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
clientRouter.delete("/:id", authMiddleware, deleteClient);

module.exports = clientRouter;