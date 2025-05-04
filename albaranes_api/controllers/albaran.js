const { matchedData } = require('express-validator');
const AlbaranModel = require('../models/albaran');
const { handleHttpError } = require('../utils/handleError');
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
      .populate('userId', 'name email company');

    if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
    if (!note.userId || note.userId._id.toString() !== userId.toString()) {
      return handleHttpError(res, 'No autorizado', 401);
    }

    const pdfName = `albaran_${noteId}.pdf`;
    const pdfFolder = path.join(__dirname, '..', 'albaranes'); // Carpeta correcta
    const pdfPath = path.join(pdfFolder, pdfName);

    // Crear carpeta si no existe
    if (!fs.existsSync(pdfFolder)) {
      fs.mkdirSync(pdfFolder, { recursive: true });
    }

    // Si tiene firma y pdf externo
    if (note.sign && note.pdf && process.env.NODE_ENV !== 'test') {
      try {
        const pdfUrl = `https://${note.pdf}`;
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
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

    // Crear nuevo PDF
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
      doc.text(`Cliente: ${note.clientId.name}`);
      doc.text(`Dirección: ${note.clientId.address || ''}`);
      doc.text(`CIF: ${note.clientId.cif || 'No CIF'}`);
    }

    doc.moveDown();
    doc.fontSize(14).text('Detalles:', { underline: true });

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



module.exports = {createAlbaran,getAlbaran,getAlbaranById,generarPDFAlbaran};