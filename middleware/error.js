const ErrorResponse = require("../utils/errorResponse");

// Just don't put wrong parameters's order (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  // Although message key may not appears in "err" object (this makes "error" doesn't have message key at first and error.message will be undefined), it still has it as a property (see Error class in errorResponse.js that had been inherited by ErrorReponse) so u can still take it out and set error.message
  error.message = err.message;

  // Mongoose bad Object id
  if (err.name === "CastError") {
    const msg = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(msg, 404);
  }
  // Mongoose duplicate key value
  if (err.code === 11000) {
    const msg = `Bootcamps with this ${Object.keys(err.keyValue).join(
      ", "
    )} existed`;
    // 400 or 409 works just fine
    // 400 Bad Request - when the server will not process a request because it's obvious client fault
    // 409 Conflict - if the server will not process a request, but the reason for that is not the client's fault
    error = new ErrorResponse(msg, 400);
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const msg = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(msg, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};
module.exports = errorHandler;
