// const errorController = {};

// // Function that triggers an error
// errorController.triggerError = (req, res, next) => {
//   throw new Error("This is an intentional server error for testing purposes.");
// };

// module.exports = errorController;


const errorController = {};

errorController.triggerError = (req, res, next) => {
  const error = new Error("Intentional Server Error");
  error.status = 500;
  next(error);
};

module.exports = errorController;