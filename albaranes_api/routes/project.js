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
