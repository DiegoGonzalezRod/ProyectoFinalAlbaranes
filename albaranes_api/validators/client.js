const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateClient = [
  check("name")
    .exists().notEmpty().withMessage("El nombre del cliente es obligatorio")
    .isString().withMessage("El nombre debe ser un texto"),

  check("contactEmail")
    .optional()
    .isEmail().withMessage("Debe ser un email válido"),

  check("phone")
    .optional()
    .isMobilePhone().withMessage("Debe ser un número de teléfono válido"),

  check("address")
    .optional()
    .isString().withMessage("La dirección debe ser texto"),

  (req, res, next) => validateResults(req, res, next)
];

const validatorGetClientById = [
  check("id")
    .exists().withMessage("El ID es obligatorio")
    .isMongoId().withMessage("El ID debe ser un MongoID válido"),
  (req, res, next) => validateResults(req, res, next)
];


const validatorUpdateClient = [
  check("name")
    .optional()
    .isString().withMessage("El nombre debe ser un texto"),

  check("contactEmail")
    .optional()
    .isEmail().withMessage("Debe ser un email válido"),

  check("phone")
    .optional()
    .isMobilePhone().withMessage("Debe ser un teléfono válido"),

  check("address")
    .optional()
    .isString().withMessage("La dirección debe ser texto"),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorCreateClient, validatorGetClientById, validatorUpdateClient };
