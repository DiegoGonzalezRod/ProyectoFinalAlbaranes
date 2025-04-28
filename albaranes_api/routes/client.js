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

module.exports = clientRouter;
