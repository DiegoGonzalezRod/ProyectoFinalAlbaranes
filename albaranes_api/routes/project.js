const express = require("express");
const projectRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createProject } = require("../controllers/project");
const { validatorCreateProject } = require("../validators/project");


projectRouter.post("/", authMiddleware, validatorCreateProject, createProject);

module.exports = projectRouter;
