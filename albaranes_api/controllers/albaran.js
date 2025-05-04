const { matchedData } = require('express-validator');
const AlbaranModel = require('../models/albaran');
const { handleHttpError } = require('../utils/handleError');
const { handleIPFS } = require('../utils/handleIPFS');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');



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
const getAlbaran= async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const deliveryNotes = await AlbaranModel.find({
      userId: req.user._id,
      deleted: false 
    })
      .populate('clientId')
      .populate('projectId')
      .populate('userId');

    res.status(200).json(deliveryNotes);
  } catch (err) {
    console.error('Error al obtener los albaranes:', err);
    return handleHttpError(res);
  }
};


const getAlbaranById = async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
      const note = await AlbaranModel.findById(noteId)
          .populate('clientId', 'name address cif') // solo campos necesarios
          .populate('projectId', 'name code projectCode')
          .populate('userId', 'name company'); // usuario que lo creó

      if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
      if (note.userId._id.toString() !== userId) return handleHttpError(res, 'No autorizado', 401);

      const response = {
          company: note.userId.company || null,
          name: note.userId.name,
          date: note.createdAt,
          client: {
              name: note.clientId.name,
              address: note.clientId.address,
              cif: note.clientId.cif || '',
          },
          project: note.projectId.name || note.projectId.code || note.projectId.projectCode || '',
          format: note.format,
          concepts: [{
              description: note.description,
              value: note.format === 'hours' ? note.hours : note.material
          }],
          photo: note.sign || null,
      };

      return res.status(200).json(response);
  } catch (err) {
      console.error('Error al obtener el albarán:', err);
      return handleHttpError(res);
  }
};


const generarPDFAlbaran = async (req, res) => {
  const userId = req.user._id;
  const noteId = req.params.id;

  try {
    const note = await AlbaranModel.findById(noteId)
      .populate('clientId', 'name address cif')
      .populate('projectId', 'name code projectCode')
      .populate('userId', 'name email');

    if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
    if (!note.userId || note.userId._id.toString() !== userId.toString()) {
      return handleHttpError(res, 'No autorizado', 401);
    }

    const pdfName = `albaran_${noteId}.pdf`;
    const pdfFolder = path.join(__dirname, '..', 'albaranes');
    const pdfPath = path.join(pdfFolder, pdfName);

    if (!fs.existsSync(pdfFolder)) {
      fs.mkdirSync(pdfFolder, { recursive: true });
    }

    if (note.sign && note.pdf && process.env.NODE_ENV !== 'test') {
      try {
        const response = await axios.get(note.pdf, { responseType: 'arraybuffer' });
        fs.writeFileSync(pdfPath, response.data);
        return res.status(200).json({
          message: 'PDF firmado descargado correctamente',
          url: `${req.protocol}://${req.get('host')}/albaranes/${pdfName}`
        });
      } catch (error) {
        console.error('Error al descargar PDF desde IPFS:', error.message);
        return handleHttpError(res, 'Error al descargar PDF firmado', 500);
      }
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text('Albarán de Trabajo', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date(note.workdate).toLocaleDateString()}`);
    doc.text(`Proyecto: ${note.projectId?.name || 'Sin nombre'}`);
    doc.text(`Descripción: ${note.description}`);
    doc.text(`Usuario: ${note.userId?.name || 'Sin nombre'} (${note.userId?.email || 'sin email'})`);

    if (note.clientId) {
      doc.moveDown().fontSize(14).text('Cliente:', { underline: true });
      doc.fontSize(12).text(`Nombre: ${note.clientId.name}`);
      if (note.clientId.address) doc.text(`Dirección: ${note.clientId.address}`);
      if (note.clientId.cif) doc.text(`CIF: ${note.clientId.cif}`);
    }

    doc.moveDown().fontSize(14).text('Detalles:', { underline: true });
    const concepts = note.format === 'hours'
      ? [{ name: note.userId?.name || 'Usuario', hours: note.hours }]
      : [{ name: note.material || 'Material', quantity: 1 }];

    concepts.forEach((item, i) => {
      doc.fontSize(12).text(
        note.format === 'hours'
          ? `${i + 1}. ${item.name} - ${item.hours} horas`
          : `${i + 1}. ${item.name} - ${item.quantity} uds`
      );
    });

    doc.end();

    stream.on('finish', () => {
      const fileUrl = `${req.protocol}://${req.get('host')}/albaranes/${pdfName}`;
      return res.status(200).json({ message: 'PDF generado correctamente', url: fileUrl });
    });

  } catch (err) {
    console.error('Error al generar el PDF del albarán:', err);
    return handleHttpError(res, 'ERROR_GENERAR_PDF', 500);
  }
};





const signAlbaran = async (req, res) => {
  try {
    const albaranId = req.params.id;
    const userId = req.user._id;

    if (!req.file) return handleHttpError(res, 'No se ha proporcionado ningún archivo', 422);

    const note = await AlbaranModel.findById(albaranId)
      .populate('clientId', 'name address cif')
      .populate('projectId', 'name code projectCode')
      .populate('userId', 'name email');

    if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
    if (!note.userId || note.userId._id.toString() !== userId.toString()) {
      return handleHttpError(res, 'No autorizado', 401);
    }

    const { buffer, originalname } = req.file;
    const signFileName = `firma_${albaranId}${path.extname(originalname)}`;

    const uploadsPath = path.join(__dirname, '..', 'albaranes');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const localSignPath = path.join(uploadsPath, signFileName);
    fs.writeFileSync(localSignPath, buffer);

    const signIPFS = await handleIPFS(buffer, originalname);
    note.sign = signIPFS;
    note.pending = false;

    // PDF creation
    const pdfName = `albaran_${albaranId}.pdf`;
    const pdfPath = path.join(uploadsPath, pdfName);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text('Albarán de Trabajo', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date(note.workdate).toLocaleDateString()}`);
    doc.text(`Proyecto: ${note.projectId?.name || 'Sin nombre'}`);
    doc.text(`Descripción: ${note.description}`);
    doc.text(`Usuario: ${note.userId?.name || ''} (${note.userId?.email})`);

    if (note.clientId) {
      doc.text(`Cliente: ${note.clientId.name}`);
      doc.text(`Dirección: ${note.clientId.address || ''}`);
      doc.text(`CIF: ${note.clientId.cif || ''}`);
    }

    doc.moveDown();
    doc.fontSize(14).text('Detalles:', { underline: true });

    const concepts = note.format === 'hours'
      ? [{ name: note.userId.name, hours: note.hours }]
      : [{ name: note.material || 'Material', quantity: 1 }];

    concepts.forEach((item, i) => {
      doc.fontSize(12).text(
        note.format === 'hours'
          ? `${i + 1}. ${item.name} - ${item.hours} horas`
          : `${i + 1}. ${item.name} - ${item.quantity} uds`
      );
    });

    try {
      doc.addPage().image(buffer, { fit: [400, 200], align: 'center' });
      doc.text('Firma del cliente', { align: 'center' });
    } catch (e) {
      console.warn('Error al insertar firma:', e.message);
    }

    doc.end();

    stream.on('finish', async () => {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfIPFS = await handleIPFS(pdfBuffer, pdfName);
      note.pdf = pdfIPFS;

      await note.save();

      return res.status(200).json({
        message: 'Albarán firmado correctamente',
        sign: signIPFS,
        pdf: pdfIPFS,
      });
    });

  } catch (err) {
    console.error('Error al firmar albarán:', err);
    return handleHttpError(res, 'Error al firmar el albarán');
  }
};

const deleteAlbaran = async (req, res) => {
  try {
    const albaranId = req.params.id;
    const userId = req.user._id;

    const note = await AlbaranModel.findById(albaranId);

    if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
    if (!note.userId || note.userId.toString() !== userId.toString()) {
      return handleHttpError(res, 'No autorizado', 401);
    }

    if (note.sign) {
      return handleHttpError(res, 'No se puede eliminar un albarán ya firmado', 400);
    }

    await AlbaranModel.findByIdAndDelete(albaranId);

    return res.status(200).json({ message: 'Albarán eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar el albarán:', err);
    return handleHttpError(res, 'Error al eliminar el albarán', 500);
  }
};






module.exports = {createAlbaran,getAlbaran,getAlbaranById,generarPDFAlbaran,signAlbaran,deleteAlbaran};