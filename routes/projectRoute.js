const express = require('express')
const projectController = require('../controllers/projectController')
const authController=require('../controllers/authController')



const router = express.Router()

router.use(authController.protect)

router.route('/')
.get(projectController.getAllProjects)
.post(projectController.createProject)

router.route('/:id')
.get(projectController.getOneProject)
.patch(authController.restrictTo('project-manager admin') ,projectController.updateProject)
.delete(authController.restrictTo('project-manager admin'),projectController.deleteProject)

module.exports=router