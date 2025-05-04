const multer = require('multer');

// Almacenamiento en memoria (sin guardar en disco)
const storage = multer.memoryStorage();

const multermiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
  }
});

module.exports = multermiddleware;
