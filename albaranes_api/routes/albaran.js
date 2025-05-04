const express = require("express");
const albaranRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createAlbaran,getAlbaranes,getAlbaranById,generateAlbaranPDF } = require("../controllers/albaran");
const { validatorCreateAlbaran } = require("../validators/albaran"); 

albaranRouter.post("/", authMiddleware, validatorCreateAlbaran, createAlbaran);
albaranRouter.get("/", authMiddleware, getAlbaranes);
albaranRouter.get("/:id", authMiddleware, getAlbaranById);
albaranRouter.get("/pdf/:id", authMiddleware, generateAlbaranPDF); 
module.exports = albaranRouter;
