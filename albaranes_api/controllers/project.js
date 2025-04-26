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

module.exports = { createProject };
