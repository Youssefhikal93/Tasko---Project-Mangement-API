
const Task = require('../models/taskModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const handlerFactory = require('./handlerfactory')



exports.aliasTopHigh=(req,res,next)=>{
req.query.limit='1'
req.query.sort = '-priorty,createdAt'
// req.query.field = 'title'
next()
}

exports.getTaskstats=catchAsync(async(req,res,next)=>{
    const stats = await Task.aggregate([
        {
        $match:{ priorty : {$ne : 'low'} }
        },
        {
            $group:{
            _id:'$status' ,
             numTasks : { $sum : 1},
            
            }
        }
    ])
    res.status(200).json({
        status:'succsses',
        data:{
         stats
        }
    })
})

exports.getMonthlyPlan =catchAsync(async(req,res,next)=>{
    const year = req.params.year * 1;
    const plan = await Task.aggregate([
    
      {
        $match: {
          dueDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$dueDate" },
          numTaskStarts: { $sum: 1 },
          tasks: { $push: "$title" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTaskStarts: -1 },
      },
     
    ]);
  
    res.status(200).json({
      status: "sucsses",
      data: {
        plan,
      },
    });
  });
  



exports. getTaskById =catchAsync(async(req,res,next)=>{
    // const task =await Task.findById(req.params.id)
    const task =await Task.findById(req.params.id).populate({path:'activities',select: 'user description '}).
    exec();
    
    if(!task) return next( new AppError('No task with the selected ID',404))

    res.status(200).json({
        status:'succses',
        data:{
            task,
            activities:task.activities
        }
    })
})

  exports. getAllTasks = handlerFactory.getAll(Task)
  exports. createTask = handlerFactory.createOne(Task)
  exports. updateTask = handlerFactory.updateOne(Task)
  exports. deleteTask = handlerFactory.deleteOne(Task)

