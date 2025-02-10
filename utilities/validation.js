const { body, validationResult } = require("express-validator");
const utilities = require("./index"); // Add missing utilities import

const validateClassification = [
  body("classification_name")
    .trim()
    .isAlphanumeric()
    .withMessage("Classification name must contain only letters and numbers.")
    .notEmpty()
    .withMessage("Classification name is required."),
];

// Add async keyword to middleware function
const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Now properly awaited
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      messages: req.flash(),
    });
  }
  next();
};

module.exports = { validateClassification, handleValidationErrors };
