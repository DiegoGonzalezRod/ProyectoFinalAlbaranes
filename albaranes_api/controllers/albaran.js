const { matchedData } = require('express-validator');
const AlbaranModel = require('../models/albaran');
const { handleHttpError } = require('../utils/handleError');



const createAlbaran = async (req, res) => {
  
  const data = matchedData(req);

  try {
      const note = await AlbaranModel.create({
          ...data,
          userId: req.user._id,
      });

      res.status(200).json(note);
  } catch (err) {
      console.error('Error al crear albarán:', err);
      return handleHttpError(res);
  }
};

module.exports = {
  createAlbaran,
};