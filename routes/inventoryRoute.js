const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

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
router.get("/",
  utilities.handleErrors(invController.buildManagementView)  // Render the management view
);


module.exports = router;
