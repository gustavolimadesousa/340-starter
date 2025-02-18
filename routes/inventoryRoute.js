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

// Public routes (no authentication needed)
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

// Protected routes (require Employee/Admin access)
// Management view
router.get(
  "/management",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagementView)
);

// Add classification
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  validateClassification,
  handleValidationErrors,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  validateInventory,
  handleInventoryValidation,
  utilities.handleErrors(invController.addInventory)
);

// Edit inventory
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType,
  validateInventory,
  handleInventoryValidation,
  utilities.handleErrors(invController.updateInventory)
);

// Delete inventory
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirmation)
);

router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
);

// JSON route (typically for internal use)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
