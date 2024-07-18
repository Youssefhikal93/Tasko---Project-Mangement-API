const catchAsync = require("../utils/catchAsync");
const User = require('../models/userModel')
const appError = require('../utils/appError')
const handelerfactory = require('./handlerfactory')


const filterObj = (obj,...allowedFields) =>{
  const newObj={}
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) 
      newObj[el] =obj[el]
  })
return newObj
}


  exports.updateMe=catchAsync(async(req,res,next)=>{

    // limit the fields that we want to update
    if(req.body.password || req.body.passwordConfirm || req.body.email || req.body.username){
      return next(new appError('You can only update your name ',400))

    }
    // update user docment 
    const filtiredBody = filterObj(req.body,'name')
    const user = await User.findByIdAndUpdate(req.user.id,filtiredBody,{new:true,runValidators:true})
     res.status(200).json({
      status:'succses',
      user
     })
  })

  exports.getMe=(req,res,next)=>{
    req.params.id = req.user.id
    next()
  }

  exports.deActivateMe = catchAsync(async(req,res,next)=>{
    
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
      status:"succsses",

    })

  })

  // exports.activateUser =catchAsync(async(req,res,next)=>{ 
  //   const user = await User.find({active:{$eq:false}})

  //   res.status(200).json({
  //     status:'succsess',
  //     data:{
  //       user
  //     }
  //   })

  // })

  exports. createUser =(req,res)=>{
    res.status(400).json({
      status:'fail',
      message: 'You cannot create user , should be via Sign up'
    })
  }
  
  exports. getAllusers = handelerfactory.getAll(User)
  exports. getOneUser = handelerfactory.getOne(User)
  exports. updateUser =handelerfactory.updateOne(User)
  exports. deleteUser =handelerfactory.deleteOne(User)

