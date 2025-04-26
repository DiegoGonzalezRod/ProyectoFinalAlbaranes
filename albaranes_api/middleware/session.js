const { verifyToken } = require("../utils/handleJWT");
const { handleHttpError } = require("../utils/handleError");
const usersModel = require("../models/users");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return handleHttpError(res, "NOT_TOKEN", 401);

    const token = authHeader.split(" ").pop();
    const dataToken = await verifyToken(token);

    if (!dataToken || !dataToken._id) {
      return handleHttpError(res, "INVALID_TOKEN", 401);
    }

    const user = await usersModel.findById(dataToken._id); 
   

    req.user = user; 
    next();
  } catch (err) {
    handleHttpError(res, "NOT_SESSION", 401);
  }
};


module.exports = authMiddleware;