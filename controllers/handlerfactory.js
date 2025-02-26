const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatuers = require('../utils/apiFeatures')



exports.getAll = Model => catchAsync(async(req,res,next)=>{

    //Excute query
    const features = 
    new APIFeatuers(Model.find(),req.query)
    .filter()
    .sort()
    .limit()
    .paginate()
    

    const docs = await features.query
    // .explain()

    res.status(200).json({
        status:'succsses',
        results:docs.length,
        data:{
         docs
        }
    })
})

exports.getOne = Model => catchAsync(async(req,res,next)=>{
    const doc =await Model.findById(req.params.id)
    

    if(!doc) return next( new AppError('No docment with the selected ID',404))

     

    res.status(200).json({
        status:'succses',
        data:{
            doc:doc
        }
    })
})

exports.createOne = Model => catchAsync(async(req,res,next)=>{
    const newDoc = await Model.create(req.body)
    
    res.status(201).json({
        status:'succses',
        data:{
            doc:newDoc
        }
    })
})


exports.updateOne = Model=>catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body, {
        new:true,
        runValidators:true})

        if(!doc) return next( new AppError('No Docment with the selected ID',404))

    res.status(200).json({
     status:"succses",
     data:{
      doc 
     }
    })
  })


exports.deleteOne = Model => catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc) return next( new AppError('No docment with the selected ID',404))

    res.status(204).json({
     status:"succses"
    })
  })