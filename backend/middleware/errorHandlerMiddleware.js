// const errorHandler = (err, req, res, next) =>{
//     const statusCode = res.statusCode === 200?500 : res.statusCode;
//     res.status(statusCode);
//     res.json ({
//         message: err.message,
//         stack: err.stack,
//     });
// };

// module.exports = errorHandler;

const errorHandler = (err, req, res, next) => {
    // Ensure the status code is set; default to 500 if not set or if it's 200
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
      message: err.message,
      stack: err.stack,
    });
  };
  
  module.exports = errorHandler;