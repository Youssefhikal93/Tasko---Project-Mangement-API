const express = require('express')


const authController=require('../controllers/authController')
const activityController=require('../controllers/activityController')

const router = express.Router({mergeParams:true})


router.use(authController.protect)

router.route('/')
.get(activityController.getAllActivity)
.post(activityController.createActivity)

router.route('/:id')
.get(activityController.getOneActivity)
.patch(activityController.updateActivity)
.delete(authController.restrictTo('team-lead'),activityController.deleteActivity)




module.exports = router