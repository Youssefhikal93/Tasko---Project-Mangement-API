const User = require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const appError = require('../utils/appError')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

const signToken = function(id){
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
}

const createSendToken=(user,statusCode,res)=>{
  const token = signToken(user._id)

  const cookie=res.cookie('jwt',token,{
    expires:new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
    httpOnly:true
  })

  user.password=undefined;
  // secure only works for production 
  if(process.env.NODE_ENV === 'production') cookie.secure=true 
  res.status(statusCode).json({
    status:'sucsses',
    token,
    data:{
      user
    }
  })
}

exports.signup = catchAsync(async(req,res,next)=>{
  const newUser = await User.create({
    name:req.body.name,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password,
    passwordConfirm:req.body.passwordConfirm,
    // role:req.body.role,
    // passwordChangeAt: req.body.passwordChangeAt

  })
  createSendToken(newUser,201,res)

  // const token = signToken(newUser._id)

  // res.status(201).json({
  //   status:'succsses',
  //   token,
  //   data:{
  //       user:newUser
  //   }
  // })
})


exports.login=catchAsync(async(req,res,next)=>{
    const {email,password} = req.body

    // 1 email & password exist 
    if(!email || !password){
        return next(new appError('please provide email and passowrd',400))
    }


    //2 check if user exist && password correct
    const user = await User.findOne({ email: email }).select("+password").select('+active').select('+loginAttempts').select('+maxLoginAttempts').select('+locked');
     
       

    // console.log(user);
      
    // sending error if the user in in-active
  // // check is user is inactive 
  // if (user.active === false){
  //   return next(new appError("Your user in-Active please contact your line manager to activate it ", 401));
  // }

if(!user) {
  return next(new appError("Your email dosn't exist, please sign up", 401))
}

// ceckhing if the customer is locked
if(user.locked && !(await user.correctPassword(password, user.password))){
  return next(new appError("your account is locked please contact our admin 😁", 401))
}
//check login attempts and lock the user 
user.loginAttempts++
await user.save({validateBeforeSave:false})
// console.log(user);
if(user.loginAttempts>= user.maxLoginAttempts){
 user.locked=true 
 await user.save({validateBeforeSave:false})

  return next(new appError("your account is locked please try  contact our admin", 401))
    
  
    } else {
      if (!user || !(await user.correctPassword(password, user.password))) {
        //returing the original error 
        return next(new appError("incorrect email or passowrd", 401));
      }
  }

  

  // check is user is inactive and activate once he log in 
  let message;
   if (user.active === false){
    message = ' Your account was in-Active ans just re-activated , welcome back ^ _ ^ '
  
  }
  user.active = true
  user.loginAttempts=0
  user.lastLoginAttempt=Date.now()
  await user.save({validateBeforeSave: false})
  // console.log(user);
   
    //3 check if everything is ok 

    // createSendToken(user,200,res)
    const token = signToken(user._id)


    res.status(200).json({
        status:'sucsses',
        message,
        token 
    })
})


exports.protect=catchAsync(async(req,res,next)=>{
    let token;
    // 1 getting token if exists 
     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(" ")[1]
        }
         if(!token)  {
          return next(new appError('Your are not logged in , please log in to grant the accsses',401))
                     }
    //2 validate token (verification)
    const decoded=  await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    //3 check is user exist 
    const freshUser = await User.findById(decoded.id)
    if(!freshUser) {
        return new appError('The user no longer exist',401)
    }
    //4 check if user changes password 
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError('Please log in again due to password change',401))
    } 

    // grant accsses 
    req.user = freshUser

    next()
})

exports.restrictTo= (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){

            return next(new appError('User have no persmission to procced wth the action',401))
        }
        next()
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }).select('+locked');
  if (!user) {
    return next(new appError('There is no user with email address.', 404));
  }

  if(user.locked){
    return next(new appError("your account is locked please try again after 1 hour or contact our admin 😁", 401))
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
  ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async(req,res,next)=>{

    // get user based on the token 
    const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({passwordResetToken : hasedToken,
      passwordResetExpires :{$gt:Date.now()}
    })

    //check if token not expired
    if(!user){
        return next (new appError('Token is invalid or expired',400))
    }
    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    user.passwordResetToken =undefined
    user.passwordResetExpires =undefined
    await user.save()

    // updated changed password and log the user
     createSendToken(user,200,res)
    // const token = signToken(user._id)

    // res.status(200).json({
    //     status:'succsses',
    //     token
    // })
})


exports.updatePassword=catchAsync(async(req,res,next)=>{
    // get user from collection 
      const user = await User.findById(req.user.id).select('+password')
    // if currentPassword is correct 
    if(!( await user.correctPassword(req.body.currentPassword, user.password))){
        return next( new appError('Your current password is in correct',401))
    }
       
    // update password 
       
      user.password=req.body.password
      user.passwordConfirm=req.body.passwordConfirm
      await user.save()
    
      //log the user in 
      const token = signToken(user._id)

      res.status(200).json({
          status:'succsses',
          token
      })
      
})