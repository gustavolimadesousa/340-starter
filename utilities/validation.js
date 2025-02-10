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


// Enhanced validation rules
const validateInventory = [
  body("classification_id")
    .notEmpty().withMessage("Classification is required"),
  
  body("inv_make")
    .trim()
    .isLength({ min: 1 }).withMessage("Make is required")
    .matches(/^[\w-]+$/).withMessage("Make must be alphanumeric"),
  
  body("inv_model")
    .trim()
    .isLength({ min: 1 }).withMessage("Model is required")
    .matches(/^[\w-]+$/).withMessage("Model must be alphanumeric"),
  
  body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Valid year between 1900 and current year+1 required"),
  
  body("inv_price")
    .isFloat({ min: 0.01 }).withMessage("Valid price greater than 0 required"),
  
  body("inv_miles")
    .isInt({ min: 0 }).withMessage("Miles must be 0 or greater"),
  
  body("inv_color")
    .trim()
    .isLength({ min: 1 }).withMessage("Color is required")
];

// In handleInventoryValidation
const handleInventoryValidation = async (req, res, next) => {
  const errors = validationResult(req);
  const errorData = errors.isEmpty() ? [] : errors.array(); // Always return array

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Now properly awaited
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    );
    return res.render("inventory/add-inventory", {
      errors: errorData, // Pass as array even when empty
      classificationList,
      formData: req.body,
      nav,
    });
  }
  next();
};

module.exports = {
  validateClassification,
  handleValidationErrors,
  validateInventory,
  handleInventoryValidation,
};
