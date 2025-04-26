const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');
//const { validate } = require('../models/storage');

const validatorCreateItem = [
    check('name').exists().notEmpty().isString().withMessage('El nombre no es válido'),
    check('email').exists().notEmpty().isEmail().withMessage('El mail no es válido'),
    check('password').exists().notEmpty().isLength({min: 8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    check("code").exists().notEmpty().withMessage("El código es obligatorio").isLength({ min: 6, max: 6 }).withMessage("Debe tener 6 dígitos").isNumeric().withMessage("Debe ser numérico"),

    (req,res,next) => validateResults(req,res,next)
]
const validatorGetItem = [
    check('email').exists().notEmpty().isEmail(),
    check('password').exists().notEmpty(),
    (req,res,next) => validateResults(req,res,next)
]

const validatorVerifyCode = [
  check("code")
    .exists().notEmpty().withMessage("El código es obligatorio")
    .isLength({ min: 6, max: 6 }).withMessage("El código debe tener 6 dígitos")
    .isNumeric().withMessage("El código debe ser numérico"),
  (req, res, next) => validateResults(req, res, next)
];
const validatorUpdateUserPersonalData = [
  check("name").notEmpty().withMessage("El nombre es obligatorio"),
  check("apellidos").notEmpty().withMessage("Los apellidos son obligatorios"),
  check("nif")
    .notEmpty().withMessage("El NIF es obligatorio")
    .matches(/^\d{8}[A-Za-z]$/).withMessage("Formato de NIF inválido"),

  (req, res, next) => validateResults(req, res, next)
];

  const validateCompanyData = [
    check('companyName')
      .if((value, { req }) => !req.body.isFreelance) // solo si NO es freelance
      .notEmpty().withMessage('El nombre de la empresa es obligatorio'),
    
    check('cif')
      .notEmpty().withMessage('El CIF es obligatorio')
      .isString().withMessage('El CIF debe ser un texto'),
  
    check('address')
      .notEmpty().withMessage('La dirección es obligatoria'),
  
    check('phone')
      .notEmpty().withMessage('El teléfono es obligatorio')
      .isMobilePhone().withMessage('El teléfono no es válido'),
  
    check('isFreelance')
      .optional()
      .isBoolean().withMessage('El campo isFreelance debe ser booleano'),
      (req, res, next) => validateResults(req, res, next)
  ];

  const validateRecoverPassword = [
    check('email')
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido'),
  
    check('newPassword')
      .notEmpty().withMessage('La nueva contraseña es obligatoria')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
      (req, res, next) => validateResults(req, res, next)
  ];
  

module.exports = {validatorCreateItem, validatorGetItem, validatorVerifyCode,validatorUpdateUserPersonalData,validateCompanyData, validateRecoverPassword}