const { matchedData } = require('express-validator');
const UserModel = require('../models/users');
const { encrypt,compare } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJWT');
const { handleHttpError } = require('../utils/handleError');
const User = require('../models/users');
const bcrypt = require("bcryptjs");






  const createItem = async (req, res) => {
      try{
          req = matchedData(req);
          const password = await encrypt(req.password);
          const body = {...req, password};
          const user = await UserModel.create(body);
          user.set('password', undefined, {strict: false});

          const data = {
              user: user,
              token: await tokenSign(user)
          }
          res.send(data)
      }catch(err){
          console.log(err)
          handleHttpError(res, "ERROR_REGISTER_USER")
      }
  }

/**
 * Encargado de hacer login del usuario
 * @param {*} req 
 * @param {*} res 
 */
const userLogin = async (req, res) => {
    try {
      req = matchedData(req);
      const user = await UserModel.findOne({ email: req.email }).select("password name role email status");
  
      if (!user) {
        handleHttpError(res, "USER_NOT_EXISTS", 404);
        return;
      }
  
      if (user.status !== 'validated') {
        return res.status(401).json({ error: 'Email no verificado' });
      }
  
      const check = await compare(req.password, user.password);
  
      if (!check) {
        handleHttpError(res, "INVALID_PASSWORD", 401);
        return;
      }
  
      user.set('password', undefined, { strict: false });
  
      const data = {
        token: await tokenSign(user),
        user
      };
  
      res.send(data);
  
    } catch (err) {
      console.log(err);
      handleHttpError(res, "ERROR_LOGIN_USER");
    }
  };
  


  const validateEmailCode = async (req, res) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  
    try {
      const { code } = matchedData(req); 
  
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      if (user.code.toString() !== code.toString()) {
        return res.status(400).json({ message: "Código inválido" });
      }
  
      user.status = 'validated';
      await user.save();
  
      return res.status(200).json({ message: "Email verificado correctamente" });
    } catch (error) {
      console.error("Error en validación:", error);
      return res.status(500).json({ message: "Error interno" });
    }
  };
  
  const updateUserPersonalData = async (req, res) => {
    try {
      const data = matchedData(req);
  
      const user = await UserModel.findOneAndUpdate(
        { email: req.user.email },
        {
          name: data.name,
          apellidos: data.apellidos,
          nif: data.nif
        },
        { new: true }
      );
  
      user.set('password', undefined, { strict: false });
  
      res.status(200).json({
        message: 'Datos personales actualizados correctamente',
        user
      });
    } catch (err) {
      console.log("Error en updateUserPersonalData:", err);
      res.status(403).send("ERROR_ON_BOARDING_USER");
    }
  };
  

const updateUserCompanyData = async (req, res) => {
  try {
    data = matchedData(req); 
    const { companyName, cif, address, phone, isFreelance } = data;

    if (!cif || !address || !phone) {
      return res.status(400).json({ message: "Faltan Campos Obligatorios" });
    }

    // Comprobación si es freelance
    const companyData = isFreelance ? {
      companyName: req.user.name + " " + (req.user.lastName || ""),
      cif: req.user.nif,
      address,
      phone,
      isFreelance: true
    } : {
      companyName,
      cif,
      address,
      phone,
      isFreelance: false
    };

    // Actualizar la compañía dentro del usuario
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.user.email },
      { company: companyData },
      { new: true }
    );

    res.status(200).json({ message: "Datos de empresa actualizados", company: updatedUser.company });
  } catch (err) {
    console.error("Error en onboarding empresa:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

const getUser = async (req, res) => {
  try{
    if(!req.user || !req.user._id) 
      return res.status(401).json({ message: "Token inválido o expirado" });
      const user = await UserModel.findById(req.user._id)
      user.set('password', undefined, { strict: false });
      if(!user) return res.status(404).json({ message: "Usuario no encontrado" });

      res.send({ data: user });
  }catch(err){
    console.log(err)
    handleHttpError(res, "ERROR_GET_USER")
  }
}

const deleteUser = async (req, res) => {
  try {
    if (req.query.soft !== "false") {
      user = await UserModel.findByIdAndUpdate(
        req.user._id,
        { deleted: true },
        { new: true }
      );
      user.set('password', undefined, { strict: false });
      
      return res.status(200).json({
        message: "Usuario marcado como eliminado correctamente (soft)",
        data: user,
      });
    } else {
      user = await UserModel.deleteOne({ _id: req.user._id });
      return res.status(200).json({
        message: "Usuario eliminado correctamente (hard)",
        data: user,
      });
    }
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_DELETE_USER");
  }
};

const recoverPassword = async (req, res) => {
  try {
    

    const data = matchedData(req);
    

    const email = data.email.trim().toLowerCase();
    const { newPassword } = data;

    

    const user = await UserModel.findOne({ email });
   

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
   

    const hashedPassword = await bcrypt.hash(newPassword, 10);

 
    user.password = hashedPassword;
    await user.save();

   

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_RECOVER_PASSWORD");
  }
};





module.exports = {createItem, userLogin, validateEmailCode,updateUserPersonalData,updateUserCompanyData, getUser, deleteUser,recoverPassword};