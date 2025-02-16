const invModel = require("../models/inventory-model");
const utilities = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
utilities.getNav = async function () {
  let data = await invModel.getClassifications(); // Chamada correta

  console.log("Data received in getNav:", data); // Verifica se os dados estão corretos

  if (!Array.isArray(data)) {
    console.error("Error: getClassifications() did not return an array", data);
    return "<ul><li>Error loading navigation</li></ul>";
  }

  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.forEach((row) => {
    // Mudança: removendo `.rows`
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};


/* **************************************
 * Build the classification view HTML
 * ************************************ */
utilities.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Format the vehicle's data into HTML.
 * ************************************ */
utilities.wrapVehicleInHTML = function (vehicle) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const priceFormatted = formatter.format(vehicle.inv_price);
  const mileageFormatted = new Intl.NumberFormat("en-US").format(
    vehicle.inv_miles
  );

  return `
    <div class="vehicle-detail">
      <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="vehicle-detail-container">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
        <div class="vehicle-info">
          <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p><strong>Price:</strong> ${priceFormatted}</p>
          <p><strong>Mileage:</strong> ${mileageFormatted} miles</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
utilities.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

utilities.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications();
  let list =
    '<select name="classification_id" id="classificationList" class="form-control" required>';
  list += '<option value="">Choose a Classification</option>';
  data.forEach((row) => {
    list += `<option value="${row.classification_id}"`;
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
utilities.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
 utilities.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


module.exports = utilities;
