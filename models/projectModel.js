const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Project must have a name'],
        unique:true
    },
    description:{
        type:String,
        trim:true 
    },
    createdAt:{
        type:Date,
        default:Date.now()
             },
    endDate:{
        type : Date,
        validate:{
            validator: function(value){
                return  value > this.createdAt
            },
            message : 'end date cannot be ealier than creation date'
                 }
        },
    status:{
        type:String,
        enum:{
            values:['completed','archived','active'],
        message: 'status should be active , completed or archived'}
    },
    owner:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]

})

//to not show the archived projects 
projectSchema.pre(/^find/, function (next) {
    // points to the current query
    this.find({ status: { $ne: 'archived' } });
    next();
  });


projectSchema.pre(/^find/,function(next){
    this.populate({path:'owner',
        select:'username name role'
      })
  
    next()
})

const Project =mongoose.model('Project',projectSchema)

module.exports=Project 