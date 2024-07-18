const express = require('express')

const taskController = require('../controllers/taskController')
const authController = require('../controllers/authController')
const activityController = require('../controllers/activityController')
const activityRouter = require('./activityRoute')


const router= express.Router()

// router.param('id',taskController.checkID)

router.use(authController.protect)

router
.route('/top-high-tasks')
.get(taskController.aliasTopHigh,taskController.getAllTasks)

router.route('/task-stats').get(taskController.getTaskstats)
router.route('/get-monthly-plan/:year').get(taskController.getMonthlyPlan)

router
.route('/')
.get(taskController.getAllTasks)
.post(authController.restrictTo('admin','team-lead'),taskController.createTask)

router
.route('/:id')
.get(taskController.getTaskById)
.patch(authController.restrictTo('admin','project-manager','team-lead'),taskController.updateTask)
.delete(authController.restrictTo('admin','project-manager','team-lead'),
    taskController.deleteTask)


    router.use('/:taskId/activitylog',activityRouter)
// router
// .route('/:taskId/activitylog')
// .post(authController.protect,activityController.createActivity)

module.exports=router