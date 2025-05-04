const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");


const validatorCreateAlbaran = [
  check("project")
    .exists().withMessage("El ID del proyecto es obligatorio")
    .isMongoId().withMessage("Debe ser un ID válido de MongoDB"),

  check("type")
    .exists().withMessage("El tipo es obligatorio (hours o materials)")
    .isIn(["hours", "materials"]).withMessage("El tipo debe ser 'hours' o 'materials'"),

  check("items")
    .isArray({ min: 1 }).withMessage("Items debe ser un array con al menos un elemento"),

  check("items.*.description")
    .exists().withMessage("La descripción de cada ítem es obligatoria")
    .isString().withMessage("La descripción debe ser un texto"),

  check("items.*.quantity")
    .exists().withMessage("La cantidad es obligatoria")
    .isNumeric().withMessage("La cantidad debe ser un número"),

  (req, res, next) => validateResults(req, res, next)
];





module.exports = { validatorCreateAlbaran };
