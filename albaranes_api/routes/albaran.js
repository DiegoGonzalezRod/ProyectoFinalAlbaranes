
const express = require("express");
const albaranRouter = express.Router();
const authMiddleware = require("../middleware/session");
const multermiddleware = require("../middleware/multermiddleware");
const { createAlbaran,getAlbaran,getAlbaranById,generarPDFAlbaran,signAlbaran,deleteAlbaran} = require("../controllers/albaran");
const { ValidatorCreateAlbaran } = require("../validators/albaran");

albaranRouter.post("/", authMiddleware, ValidatorCreateAlbaran, createAlbaran);
albaranRouter.get("/", authMiddleware, getAlbaran);
albaranRouter.get("/:id", authMiddleware, getAlbaranById); 
albaranRouter.get("/pdf/:id",authMiddleware, generarPDFAlbaran); 
albaranRouter.post('/sign/:id', authMiddleware, multermiddleware.single('file'), signAlbaran);
albaranRouter.delete('/:id', authMiddleware, deleteAlbaran);

module.exports = albaranRouter;



/**
 * @openapi
 * components:
 *   schemas:
 *     Albaran:
 *       type: object
 *       required:
 *         - description
 *         - workdate
 *         - format
 *       properties:
 *         description:
 *           type: string
 *           example: Trabajo de instalación eléctrica
 *         workdate:
 *           type: string
 *           format: date
 *           example: 2025-05-01
 *         format:
 *           type: string
 *           enum: [hours, materials]
 *           example: hours
 *         hours:
 *           type: number
 *           example: 8
 *         material:
 *           type: string
 *           example: Cableado y tubos PVC
 */

/**
 * @openapi
 * /albaran:
 *   post:
 *     summary: Crear un albarán
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Albaran'
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 */
albaranRouter.post("/", authMiddleware, ValidatorCreateAlbaran, createAlbaran);

/**
 * @openapi
 * /albaran:
 *   get:
 *     summary: Obtener todos los albaranes del usuario
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes devuelta correctamente
 */
albaranRouter.get("/", authMiddleware, getAlbaran);

/**
 * @openapi
 * /albaran/{id}:
 *   get:
 *     summary: Obtener albarán por ID
 *     tags: [Albaran]
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
 *         description: Albarán devuelto correctamente
 *       404:
 *         description: Albarán no encontrado
 */
albaranRouter.get("/:id", authMiddleware, getAlbaranById);

/**
 * @openapi
 * /albaran/pdf/{id}:
 *   get:
 *     summary: Generar o recuperar el PDF de un albarán
 *     tags: [Albaran]
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
 *         description: PDF generado o descargado correctamente
 *       500:
 *         description: Error al generar o recuperar el PDF
 */
albaranRouter.get("/pdf/:id", authMiddleware, generarPDFAlbaran);

/**
 * @openapi
 * /albaran/sign/{id}:
 *   post:
 *     summary: Firmar albarán subiendo una imagen
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       422:
 *         description: Archivo no proporcionado o inválido
 */
albaranRouter.post(
  "/sign/:id",
  authMiddleware,
  multermiddleware.single("file"),
  signAlbaran
);

/**
 * @openapi
 * /albaran/{id}:
 *   delete:
 *     summary: Eliminar albarán (solo si no está firmado)
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado correctamente
 *       403:
 *         description: No se puede eliminar un albarán ya firmado
 *       404:
 *         description: Albarán no encontrado
 */
albaranRouter.delete("/:id", authMiddleware, deleteAlbaran);