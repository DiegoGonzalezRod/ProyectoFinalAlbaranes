const { check } = require('express-validator');

const ValidatorCreateAlbaran = [
  check('clientId').notEmpty().withMessage('El clientId es obligatorio'),
  check('projectId').notEmpty().withMessage('El projectId es obligatorio'),
  check('format').isIn(['material', 'hours']).withMessage('El formato debe ser "material" o "hours"'),
  check('description').notEmpty().withMessage('La descripción es obligatoria'),
  check('workdate').notEmpty().withMessage('La fecha de trabajo es obligatoria'),

  check('material').if((value, { req }) => req.body.format === 'material').notEmpty().withMessage('El material es obligatorio'),
  check('hours').if((value, { req }) => req.body.format === 'hours').isNumeric().withMessage('Las horas deben ser numéricas'),
];

module.exports = { ValidatorCreateAlbaran };