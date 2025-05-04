
const express = require("express");
const albaranRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createAlbaran,getAlbaran,getAlbaranById,generarPDFAlbaran} = require("../controllers/albaran");
const { ValidatorCreateAlbaran } = require("../validators/albaran");

albaranRouter.post("/", authMiddleware, ValidatorCreateAlbaran, createAlbaran);
albaranRouter.get("/", authMiddleware, getAlbaran);
albaranRouter.get("/:id", authMiddleware, getAlbaranById); 
albaranRouter.get("/pdf/:id",authMiddleware, generarPDFAlbaran); 

module.exports = albaranRouter;
