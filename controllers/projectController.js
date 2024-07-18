const Project = require('../models/projectModel')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

const handlerFactory=require('./handlerfactory')

exports.getAllProjects = handlerFactory.getAll(Project)
exports.getOneProject = handlerFactory.getOne(Project)
exports.createProject= handlerFactory.createOne(Project)
exports.deleteProject = handlerFactory.deleteOne(Project)
exports.updateProject = handlerFactory.updateOne(Project)