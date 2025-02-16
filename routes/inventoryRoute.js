const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const {
  validateClassification,
  handleValidationErrors,
} = require("../utilities/validation");
const {
  validateInventory,
  handleInventoryValidation,
} = require("../utilities/validation");


// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to deliver specific inventory item detail
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildDetailView)
);

// Add a new route for the management view
router.get("/management",
  utilities.handleErrors(invController.buildManagementView)  // Render the management view
);

// Route to display the add classification form
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to handle the form submission
router.post(
  "/add-classification",
  validateClassification,
  handleValidationErrors,
  utilities.handleErrors(invController.addClassification)
);


// GET route to display add inventory form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// POST route to handle form submission
router.post(
  "/add-inventory",
  validateInventory,
  handleInventoryValidation,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);



module.exports = router;
