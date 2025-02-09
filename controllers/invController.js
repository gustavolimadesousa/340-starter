const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  // Check if data is not empty
  if (data && data.length > 0) {
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } else {
    res.render("./inventory/classification", {
      title: "No vehicles found",
      nav: await utilities.getNav(),
      grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
    });
  }
};

module.exports = invCont;

// Build inventory detail view
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId;

  try {
    const vehicleData = await invModel.getVehicleById(invId);

    if (vehicleData) {
      let nav = await utilities.getNav();
      const detailHTML = utilities.wrapVehicleInHTML(vehicleData);

      res.render("./inventory/detail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        detailHTML,
      });
    } else {
      res.status(404).render("./inventory/detail", {
        title: "Vehicle Not Found",
        nav: await utilities.getNav(),
        detailHTML: '<p class="notice">Vehicle not found.</p>',
      });
    }
  } catch (error) {
    console.error("Error building detail view:", error);
    res.status(500).render("./inventory/detail", {
      title: "Error",
      nav: await utilities.getNav(),
      detailHTML: '<p class="notice">An error occurred while fetching the vehicle details.</p>',
    });
  }
};

// Add the buildManagementView function to render the management page
invCont.buildManagementView = async function (req, res, next) {
  try {
    // Prepare the necessary data (flash messages and navigation)
    let nav = await utilities.getNav();

    // Flash message for testing
    req.flash("info", "Welcome to the Inventory Management Page!");

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("info"), // Flash messages (e.g., success or error messages)
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error); // Pass to the next error handler
  }
};