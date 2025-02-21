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
    let nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    // DEBUG: Verify data structure
    console.log("Management view classifications:", classifications);
    console.log(
      "Type:",
      Array.isArray(classifications) ? "Array" : typeof classifications
    );
    console.log("First item:", classifications[0]);

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classifications: classifications,
      messages: req.flash("info"),
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error);
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  try {
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  try {
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("notice", `Successfully updated ${itemName}`);
      res.redirect("/inv/management");
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    req.flash("error", "Update failed. Please check your inputs.");
    res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: utilities.handleErrors(error),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
};


/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  try {
    const nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);

  try {
    const deleteResult = await invModel.deleteInventoryItem(inv_id);
    
    if (deleteResult.rowCount > 0) {
      req.flash("notice", "Inventory item deleted successfully.");
      res.redirect("/inv/management");
    } else {
      req.flash("error", "Delete failed - item not found.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    req.flash("error", "Delete failed - database error.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

// Add this method to invController.js
invCont.searchInventory = async function (req, res, next) {
  const query = req.query.q; // Get the search query from the URL

  try {
    const results = await invModel.searchInventory(query);
    const nav = await utilities.getNav();

    res.render("./inventory/search-results", {
      title: "Search Results",
      nav,
      results,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    next(error);
  }
};

module.exports = invCont;