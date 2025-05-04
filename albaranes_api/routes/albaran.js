
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
