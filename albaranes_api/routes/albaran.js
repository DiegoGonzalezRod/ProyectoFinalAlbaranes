
const express = require("express");
const albaranRouter = express.Router();
const authMiddleware = require("../middleware/session");
const { createAlbaran } = require("../controllers/albaran");
const { ValidatorCreateAlbaran } = require("../validators/albaran");

albaranRouter.post("/", authMiddleware, ValidatorCreateAlbaran, createAlbaran);

module.exports = albaranRouter;
