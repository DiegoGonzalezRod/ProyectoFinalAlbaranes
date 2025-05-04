const express = require("express");
const projectRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createProject, updateProject,getProjects,getProjectById,archiveProject,deleteProject,getArchivedProjects,recoverProject} = require("../controllers/project");
const { validatorCreateProject } = require("../validators/project");
const {validatorUpdateProject} = require("../validators/project");
const { validatorGetProjectById } = require("../validators/project");
const { validatorArchiveProject } = require("../validators/project");



projectRouter.post("/", authMiddleware, validatorCreateProject, createProject);
projectRouter.get("/archivados", authMiddleware, getArchivedProjects);
projectRouter.get("/:id", authMiddleware, validatorGetProjectById, getProjectById);
projectRouter.put("/:id", authMiddleware, validatorUpdateProject, updateProject);
projectRouter.get("/", authMiddleware, getProjects);
projectRouter.patch("/:id/archivar", authMiddleware, validatorArchiveProject, archiveProject);
projectRouter.delete("/:id", authMiddleware, validatorArchiveProject, deleteProject);
projectRouter.patch("/:id/recuperar", authMiddleware, recoverProject);


module.exports = projectRouter;


/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           example: Proyecto de Desarrollo Web
 *         description:
 *           type: string
 *           example: Desarrollo de una tienda online
 */

/**
 * @openapi
 * /project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 */
projectRouter.post("/", authMiddleware, validatorCreateProject, createProject);

/**
 * @openapi
 * /project:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
projectRouter.get("/", authMiddleware, getProjects);

/**
 * @openapi
 * /project/archivados:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
projectRouter.get("/archivados", authMiddleware, getArchivedProjects);

/**
 * @openapi
 * /project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Project]
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
 *         description: Proyecto obtenido correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
projectRouter.get("/:id", authMiddleware, validatorGetProjectById, getProjectById);

/**
 * @openapi
 * /project/{id}:
 *   put:
 *     summary: Actualizar proyecto por ID
 *     tags: [Project]
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
projectRouter.put("/:id", authMiddleware, validatorUpdateProject, updateProject);

/**
 * @openapi
 * /project/{id}/archivar:
 *   patch:
 *     summary: Archivar un proyecto
 *     tags: [Project]
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
 *         description: Proyecto archivado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
projectRouter.patch("/:id/archivar", authMiddleware, validatorArchiveProject, archiveProject);

/**
 * @openapi
 * /project/{id}/recuperar:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     tags: [Project]
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
 *         description: Proyecto recuperado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
projectRouter.patch("/:id/recuperar", authMiddleware, recoverProject);

/**
 * @openapi
 * /project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Project]
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
 *         description: Proyecto eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
projectRouter.delete("/:id", authMiddleware, validatorArchiveProject, deleteProject);


