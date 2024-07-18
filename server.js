const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app')

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exceptions!!!");
  process.exit(1);
});

// Database connection 
const DB = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD,
  );

mongoose
.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  // console.log(con.connections);
  console.log("DB conncection sucsses.....");
});

const PORT = process.env.PORT || 3000;

//Server configration ......
const server =app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log('Unhandled rejection !!!');
  server.close(()=>{
    process.exit(1)
  })
}
)


