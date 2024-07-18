const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const flatConfigBase = require('eslint-plugin-jsx-a11y/lib/configs/flat-config-base')

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'Name is Mandatory field'],
        lowercase:true
    },
    username:{
        type:String,
        required:[true,'User name is required'],
        unique:true,
        lowercase:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail , 'Please enter valid email']
    },
    password:{
        type:String,
        required:[true,'Password is mandatory'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //works only for create and save
            validator:function(value){
                return  value === this.password
            }
        ,message:'Passwordconfirm should be equal to your password'}
    },
    role:{
        type:String,
        enum:['developer','tester','team-lead','project-manager','admin'],
        // required:true
    },
    passwordChangedAt : Date,
    passwordResetToken : String , 
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false,
        
    },
    loginAttempts:{
        type:Number,
        required:true,
        default:0,
        select:false
    },
    locked:{
        type:Boolean,
        default:false,
        select:false
    },
    maxLoginAttempts:{
        type:Number,
        required:true,
        default:3,
        select:false

    },
    lastLoginAttempt:{type:Date}
},


)

// userSchema.pre('save',async function(next){
//     if(!this.locked) return next()});

userSchema.pre('save',async function(next){
if(!this.isModified('password')) return next();

this.password = await bcrypt.hash(this.password,12)
this.passwordConfirm = undefined

// this.password = undefined
next()
})

userSchema.pre('save',function(next){
    if (!this.isModified('password') || this.isNew) return next()

       this.passwordChangedAt = Date.now() - 1000
       next()
 })



userSchema.methods.correctPassword= async function(enteredPassword,userpassword){
    return await bcrypt.compare(enteredPassword, userpassword);
}

userSchema.methods.changedPasswordAfter = function
(JWTTimeStamp) {
    if (this.passwordChangedAt) {
      const changeedTimeStamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10,
      );
      // console.log(changeedTimeStamp, JWTTimeStamp);
      return JWTTimeStamp < changeedTimeStamp;
    }
    //else
    // false means not changed
    return false;
  };

  userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
  
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };



const User =mongoose.model('User',userSchema)

module.exports = User