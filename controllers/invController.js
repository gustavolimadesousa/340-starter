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

// Render the add classification form
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: [], // Pass an empty errors array
    });
  } catch (error) {
    console.error("Error building add classification view:", error);
    next(error);
  }
};

// Handle the form submission
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  try {
    // Insert the new classification into the database
    await invModel.addClassification(classification_name);

    // Flash a success message
    req.flash("info", `Classification "${classification_name}" added successfully.`);

    // Redirect to the management view
    res.redirect("/inv/management");
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("error", "Failed to add classification. Please try again.");
    res.redirect("/inv/add-classification");
  }
};


// In buildAddInventory controller
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle", // Required title
      nav,
      classificationList,
      formData: {},
      messages: req.flash(),
      errors: []
    });
  } catch (error) {
    next(error);
  }
};

// Process Inventory Addition
invCont.addInventory = async function (req, res, next) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, 
          inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;

  // Server-side validation
  const errors = [];
  if (!classification_id) errors.push({ msg: "Classification is required" });
  if (!inv_make) errors.push({ msg: "Make is required" });
  if (!inv_model) errors.push({ msg: "Model is required" });
  if (!inv_year || inv_year < 1900) errors.push({ msg: "Valid year between 1900 and current year+1 required" });
  if (!inv_price || inv_price <= 0) errors.push({ msg: "Valid price greater than 0 required" });
  if (inv_miles < 0) errors.push({ msg: "Miles must be 0 or greater" });
  if (!inv_color) errors.push({ msg: "Color is required" });

  // Always get fresh navigation data
  const nav = await utilities.getNav();
  
  // If there are validation errors, render the form again with the errors
  if (errors.length > 0) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      formData: req.body,
      messages: req.flash(),
      errors
    });
  }

  try {
    // Create inventory data object
    const invData = {
      classification_id,
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_description,
      inv_image: inv_image || '/images/vehicles/no-image.png',
      inv_thumbnail: inv_thumbnail || '/images/vehicles/no-image-tn.png',
      inv_price: parseFloat(inv_price),
      inv_miles: parseInt(inv_miles),
      inv_color
    };

    // Insert into database
    await invModel.addInventory(invData);

    // Flash success message and redirect
    req.flash("info", `Successfully added ${inv_make} ${inv_model}`);
    res.redirect("/inv/management");
  } catch (error) {
    console.error("Inventory addition error:", error);
    const classificationList = await utilities.buildClassificationList(classification_id);
    
    req.flash("error", "Failed to add inventory item. Please try again.");
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      formData: req.body,
      messages: req.flash(),
      errors: [{ msg: "Database error occurred. Please check your input." }]
    });
  }
};


module.exports = invCont;