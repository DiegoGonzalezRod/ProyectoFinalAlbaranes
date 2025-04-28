const { matchedData } = require("express-validator");
const ClientModel = require("../models/client");
const { handleHttpError } = require("../utils/handleError");

const createClient = async (req, res) => {
  try {
    const data = matchedData(req);

    // Verifica si el email ya existe para el usuario o para su empresa
    const exists = await ClientModel.findOne({
      contactEmail: data.contactEmail,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (exists) {
      return res.status(400).json({ message: "Ya existe un cliente con ese email para este usuario o su empresa" });
    }

    const body = {
      ...data,
      user: req.user._id,
      company: req.user.company?.companyName || null
    };

    const client = await ClientModel.create(body);
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};

const getClients = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const filter = {
      deleted: false,
      $or: [{ user: req.user._id }]
    };

    if (req.user.company?.companyName) {
      filter.$or.push({ company: req.user.company.companyName });
    }

    const clients = await ClientModel.find(filter);

    if (!clients.length) {
      return res.status(404).json({ message: "No se encontraron clientes" });
    }

    res.send({ data: clients });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_GET_CLIENTS");
  }
};

const getClientById = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const { id } = req.params;

    const client = await ClientModel.findOne({
      _id: id,
      deleted: false,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    res.send({ data: client });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_GET_CLIENT_BY_ID");
  }
};

const updateClient = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const { id } = req.params;
    const data = matchedData(req);

    const allowedFields = {
      name: data.name,
      contactEmail: data.contactEmail,
      phone: data.phone,
      address: data.address
    };

    const client = await ClientModel.findOneAndUpdate(
      {
        _id: id,
        deleted: false,
        $or: [
          { user: req.user._id },
          { company: req.user.company?.companyName || null }
        ]
      },
      allowedFields,
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    res.status(200).json({ data: client });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_UPDATE_CLIENT", 500);
  }
};


const archiveClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await ClientModel.findOneAndUpdate(
      { 
        _id: id, 
        deleted: false,
        $or: [
          { user: req.user._id },
          { company: req.user.company?.companyName || null }
        ]
      },
      { deleted: true },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o ya archivado" });
    }

    res.status(200).json({ message: "Cliente archivado correctamente", data: client });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_ARCHIVE_CLIENT", 500);
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ClientModel.deleteOne({
      _id: id,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    res.status(200).json({ message: "Cliente eliminado permanentemente" });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_DELETE_CLIENT", 500);
  }
};


const getArchivedClients = async (req, res) => {
  try {
    const clients = await ClientModel.find({
      deleted: true,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    res.status(200).json({ data: clients });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_GET_ARCHIVED_CLIENTS", 500);
  }
};



const recoverClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await ClientModel.findOneAndUpdate(
      {
        _id: id,
        deleted: true,
        $or: [
          { user: req.user._id },
          { company: req.user.company?.companyName || null }
        ]
      },
      { deleted: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o ya está activo" });
    }

    res.status(200).json({ message: "Cliente recuperado correctamente", data: client });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_RECOVER_CLIENT", 500);
  }
};





module.exports = { createClient,getClients,getClientById,updateClient,archiveClient,deleteClient,getArchivedClients,recoverClient };
