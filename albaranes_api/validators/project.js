const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorCreateProject = [
  check('name')
    .exists().notEmpty().withMessage('El nombre del proyecto es obligatorio')
    .isString().withMessage('El nombre debe ser un texto'),
  
  check('description')
    .optional()
    .isString().withMessage('La descripción debe ser un texto'),

  check('client')
    .exists().notEmpty().withMessage('El ID del cliente es obligatorio')
    .isMongoId().withMessage('Debe ser un ID de Mongo válido'),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorCreateProject };
