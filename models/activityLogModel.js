const mongoose = require('mongoose')
const Task = require('./taskModel')


const activitySchema = new mongoose.Schema({
 task:{
    type:mongoose.Schema.ObjectId,
    ref:'Task',
    required:[true,'Activity must belong to Task']
 },

 user:[{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'Activity must belong to user']
 }],
 action : {
    type:String,
    enum:{
        values:['completed' , 'comment' , 'update'],
        message:'action should be between completed,comment and update'
    } 
} , 
 description:String, 
 timeStamp : {
    type:Date,
    default:Date.now()
 }

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// activitySchema.pre('save', async function (next) {
//     const task = await Task.findById(this.task);
//     if (!task || !task.assignedTo.some(user => user._id.toString() === req.user.id)) {
//       return next(new Error('Unauthorized to modify this activity'));
//     }
//     next();
//   });

activitySchema.pre(/^find/,function(next){

    this.populate({
    //     path:'user',
    //     select:'name username'
    // }).populate({
    //     path:'task',
    //     select: "title dueDate createdAt _id"
    // })
         path:'user',
        select:'name username'
    })
    next()
})



// activitySchema.pre('save',async function(next){
//     const taskPromise = this.task.map(async el=> await Task.findById(el))
    
//     this.task = await Promise.all(taskPromise)
//     next()
// })

const Activity = mongoose.model('Activity',activitySchema)

module.exports = Activity

