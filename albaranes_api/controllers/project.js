const { matchedData } = require('express-validator');
const ProjectModel = require('../models/project');
const { handleHttpError } = require('../utils/handleError');

const createProject = async (req, res) => {
  try {
    const data = matchedData(req);

    
    const exists = await ProjectModel.findOne({
      name: data.name,
      user: req.user._id
    });

    if (exists) {
      return res.status(400).json({ message: "Ya existe un proyecto con ese nombre para este usuario" });
    }

    const body = {
      ...data,
      user: req.user._id,
      company: req.user.company?.companyName || null
    };

    const project = await ProjectModel.create(body);

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_CREATE_PROJECT", 500);
  }
};

const updateProject = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const { id } = req.params;
    const data = matchedData(req);

    const allowedFields = {
      name: data.name,
      description: data.description
    };

    const project = await ProjectModel.findOneAndUpdate(
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

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    res.status(200).json({ data: project });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_UPDATE_PROJECT", 500);
  }
};

const getProjects = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const projects = await ProjectModel.find({
      deleted: false,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (!projects.length) {
      return res.status(404).json({ message: "No se encontraron proyectos" });
    }

    res.status(200).json({ data: projects });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_GET_PROJECTS");
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await ProjectModel.findOne({
      _id: id,
      deleted: false,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    res.status(200).json({ data: project });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_GET_PROJECT_BY_ID", 500);
  }
};

const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await ProjectModel.findOneAndUpdate(
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

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    res.status(200).json({ message: "Proyecto archivado correctamente", data: project });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_ARCHIVE_PROJECT", 500);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await ProjectModel.findOne({
      _id: id,
      deleted: false,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
    }

    await ProjectModel.deleteOne({ _id: id });

    res.status(200).json({ message: "Proyecto eliminado permanentemente" });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_DELETE_PROJECT", 500);
  }
};

const getArchivedProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.find({
      deleted: true,
      $or: [
        { user: req.user._id },
        { company: req.user.company?.companyName || null }
      ]
    });

    res.status(200).json({ data: projects });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_GET_ARCHIVED_PROJECTS", 500);
  }
};

const recoverProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await ProjectModel.findOneAndUpdate(
      { _id: id, deleted: true },
      { deleted: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado o ya está activo" });
    }

    res.status(200).json({ message: "Proyecto recuperado correctamente", data: project });
  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_RECOVER_PROJECT", 500);
  }
};




module.exports = { createProject, updateProject,getProjects, getProjectById,archiveProject,deleteProject,getArchivedProjects,recoverProject };
