const express = require("express")
const {createItem} = require('../controllers/users');
const {userLogin} = require('../controllers/users');
const {updateUserPersonalData } = require('../controllers/users');
const {updateUserCompanyData } = require('../controllers/users');
const {getUser} = require('../controllers/users');
const {deleteUser} = require('../controllers/users');
const {recoverPassword} = require('../controllers/users');
const { validatorCreateItem, validatorGetItem, validateRecoverPassword } = require("../validators/user");
const { validateEmailCode } = require('../controllers/users');
const { validatorVerifyCode } = require('../validators/user');
const { validatorUpdateUserPersonalData } = require('../validators/user');
const { validateCompanyData } = require('../validators/user');
const authMiddleware = require('../middleware/session');

const userRouter = express.Router();
userRouter.post('/register', validatorCreateItem, createItem);
userRouter.post('/login', validatorGetItem, userLogin);
userRouter.post('/validation', authMiddleware, validatorVerifyCode, validateEmailCode);
userRouter.patch('/onboardingUser', authMiddleware,validatorUpdateUserPersonalData,updateUserPersonalData); 
userRouter.patch('/onboardingCompany', authMiddleware,validateCompanyData,updateUserCompanyData);
userRouter.get('/getUser', authMiddleware,getUser); 
userRouter.delete('/deleteUser', authMiddleware, deleteUser);
userRouter.put("/recover-password",validateRecoverPassword,recoverPassword);


module.exports = userRouter