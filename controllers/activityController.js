const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')

const Activity = require('../models/activityLogModel')
const Task = require('../models/taskModel')

const handlerFactory = require('./handlerfactory')



exports.getAllActivity=catchAsync(async(req,res,next)=>{
    let filter={}
    if(req.params.taskId) filter={task:req.params.taskId}

const activities = await Activity.find(filter).select('-__v')

res.status(200).json({
    status:'succses',
    results:activities.length,
    data:{
        activities
    }
})
})

exports.createActivity = catchAsync(async(req,res,next)=>{

    if(!req.body.task) req.body.task=req.params.taskId
    if(!req.body.user) req.body.user=req.user.id

    // making sure that the assigned user is the only one can make action in the activity log 
    const task = await Task.findById(req.params.taskId)
    if (!task || !task.assignedTo.some(user => user._id == req.user.id)) {
        // !task.assignedTo.some(user => user._id.toString()===req.user.id
    
        console.log(req.user.id);
        console.log(task.assignedTo[0]._id.toString());
        
        return next(new AppError('Unauthorized to modify this activity'))
    }
    const newActivity = await Activity.create(req.body)

    res.status(201).json({
        status:'sucsses',
        data:{
            activity: newActivity
        }
    })
})

exports.getOneActivity = handlerFactory.getOne(Activity)
exports.deleteActivity=handlerFactory.deleteOne(Activity)
exports.updateActivity=handlerFactory.updateOne(Activity)

