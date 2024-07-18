const mongoose = require('mongoose')
const slugify = require ('slugify')

const User = require('./userModel')
const Project = require('./projectModel')

const taskSchema = new mongoose.Schema ({
    assignedTo:[{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true,'Task must belongs to user']
    }],
    projectRef:Array
    // {
    //     type:mongoose.Schema.ObjectId,
    //       ref:'Project',
    //       required:[true,'Task must belong to a project']
    //     }
    ,
    title:{
        type:String,
        required:[true,'Task must have a title'],
        unique: true ,
        maxLength:[50,'max length is 50 charachters'],
        minLength:[8,'minimum length is 8 charachters'],
    },
    description:{
        type: String,
        trim:true
    },
    status:{
        type:String,
        enum:['not-started','in-prgoress','done']
    },
    priorty:{
        type:String,
        enum:{
        values:['high','meduim','low'],
        message: 'priorty msut be low , meduim or high'
      },
        default:'meduim'
    },
    dueDate:{
        type : Date,
        validate:{
            validator: function(value){
                return  value > this.createdAt
            },
            message : 'due date cannot be ealier than creation date'

        }
    },
    createdAt:{
        type: Date,
        default:Date.now()
    },
    slug:String,
    // activities:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'Activity'
    // }]
    
},
{
    toJSON:{virtulas:true},
    toObject:{virtuals:true}
}
)

taskSchema.index({status:-1 , dueDate:1 , priorty:1})

taskSchema.pre('save',function(next){
    this.slug = slugify(this.title,{lower:true})
    next()
})


taskSchema.virtual('activities',{
    ref:'Activity',
    foreignField:'task',
    localField:'_id'
})




//Embedding the project to the task 
taskSchema.pre('save',  async function(next){

    // const prjectDetails = await Project.findById(this.project)
    // this.prject = prjectDetails
     const projectPromise = this.projectRef.map(async el=> await Project.findById(el))

     this.projectRef = await Promise.all(projectPromise) 
    next()
})


// populate the users(assigned to) into tasks 
taskSchema.pre(/^find/,function(next){
    this.populate({path:'assignedTo',
        select:'name username role'
      })
  
    next()

})

const Task = mongoose.model('Task',taskSchema)




module.exports=Task