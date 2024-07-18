const express = require("express")

const morgan = require('morgan')
const rateLimit =require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const taskRouter = require('./routes/tasksRoute')
const userRouter = require('./routes/usersRoute')
const projectRouter= require('./routes/projectRoute')
const activityRouter= require('./routes/activityRoute')

const appError = require('./utils/appError')
const errorHandler = require('./controllers/errorController')

const app = express();

//MIDDLEWARES

// limit the requests from IP
app.use(helmet())

// enhancing DEV ENV
if(process.NODE_ENV==='development'){
app.use(morgan('dev'))
}

// limit the requests from IP
const limiter=rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:'Too many requests from the IP'
})
app.use('/api',limiter)


// Body parser & and limiting the data size
app.use(express.json({limit:'10kb'}))

//data sanitization aganist no sql injection
app.use(mongoSanitize())

// sanitze html injection
app.use(xss())

// prevent paramter pollution
app.use(hpp({
    whitelist:['priorty','status','dueDate','createdAt','username' , 'email']
}))




app.use(cors())
app.options('*', cors());


// app.get('/api/v1/tasks',getAllTasks )
// app.get('/api/v1/tasks/:id',getTask)
// app.post('/api/v1/tasks',createTask)
// app.patch('/api/v1/tasks/:id', updateTask)
// app.delete('/api/v1/tasks/:id', deleteTask)

//Mounting the ROUTES

app.use('/api/v1/tasks',taskRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/projects',projectRouter)
app.use('/api/v1/activities',activityRouter)

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:` Route is not defined ${req.originalUrl}`
    // }) 
    next( new appError(` Route is not defined ${req.originalUrl}`,404))
})

app.use(errorHandler)



//MIDDLEWARES.... 
// app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.static('public'))

// app.set('view engine','ejs')


// dotenv.config({path : './config.env'})


module.exports = app
  



