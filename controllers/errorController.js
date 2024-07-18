const AppError = require("./../utils/appError");

const handelJsonWebTokenError = () => new AppError("Invalid token", 401);

const handelJWTExpiredError = () => new AppError("Token expired", 401);


const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const handelValidationDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = Object.values(err.keyValue);
  const field = Object.keys(err.keyValue);

 
  const message = `duplicated field ${field}: ${value}`;
  return new AppError(message, 400);
};



const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error
  if (err.isOperational) { 
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      
    });
    // Programming or other error
  } else {
       res.status(500).json({
      status: "error",
      message: "something went wrong , please try again later ot contact our support team",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // let error = { ...err };
    if (err.name === "CastError") err = handleCastErrorDB(err);

    if (err.code === 11000) err = handleDuplicateFieldDB(err);

    if (err.name === "ValidationError") err = handelValidationDB(err);

    if (err.name === "JsonWebTokenError")
      err = handelJsonWebTokenError(err);

    if (err.name === "TokenExpiredError") err = handelJWTExpiredError(err);

    // if (err.status == 'fail' && err.isOperational==true) error=handleUndfiendRoutes(error)

    sendErrorProd( err, res);
  }
};