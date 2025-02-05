// /* ******************************************
//  * This server.js file is the primary file of the
//  * application. It is used to control the project.
//  *******************************************/
// /* ***********************
//  * Require Statements
//  *************************/
// const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
// const env = require("dotenv").config();
// const app = express();
// const static = require("./routes/static");
// const baseController = require("./controllers/baseController");
// const inventoryRoute = require("./routes/inventoryRoute"); // Require the inventory route file
// const utilities = require("./utilities/");
// const errorRoute = require("./routes/errorRoute"); // Import the error route

// /* ***********************
//  * View Engine and Templates
//  *************************/
// app.set("view engine", "ejs");
// app.use(expressLayouts);
// app.set("layout", "./layouts/layout"); // not at views root

// // Index route
// // app.get("/", function (req, res) {
// //   res.render("index", { title: "Home" });
// // });
// app.get("/", utilities.handleErrors(baseController.buildHome));

// /* ***********************
//  * Routes
//  *************************/
// app.use(static);
// app.use("/inv", inventoryRoute);
// app.use("/error", errorRoute);
// // File Not Found Route - must be last route in list
// app.use(async (req, res, next) => {
//   next({ status: 404, message: "Sorry, we appear to have lost that page." });
// });

// /* ***********************
//  * Express Error Handler
//  * Place after all other middleware
//  *************************/
// app.use(async (err, req, res, next) => {
//   let nav = await utilities.getNav();
//   console.error(`Error at: "${req.originalUrl}": ${err.message}`);
//   if (err.status == 404) {
//     message = err.message;
//   } else {
//     message = "Oh no! There was a crash. Maybe try a different route?";
//   }
//   res.render("errors/error", {
//     title: err.status || "Server Error",
//     message,
//     nav,
//   });
// });

// /* ***********************
//  * Local Server Information
//  * Values from .env (environment) file
//  *************************/
// const port = process.env.PORT;
// const host = process.env.HOST;

// /* ***********************
//  * Log statement to confirm server operation
//  *************************/
// app.listen(port, () => {
//   console.log(`app listening on ${host}:${port}`);
// });


/*******************************************/
/* ***********************
 * Require Statements
 *************************/
// const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
// const env = require("dotenv").config();
// const app = express();
// const static = require("./routes/static");
// const baseController = require("./controllers/baseController");
// const inventoryRoute = require("./routes/inventoryRoute");
// const utilities = require("./utilities/");
// const errorRoute = require("./routes/errorRoute");

// /* ***********************
//  * View Engine and Templates
//  *************************/
// app.set("view engine", "ejs");
// app.use(expressLayouts);
// app.set("layout", "./layouts/layout"); // not at views root

// /* ***********************
//  * Routes
//  *************************/
// app.use(static);
// app.use("/inv", inventoryRoute);
// app.use("/error", errorRoute);

// // File Not Found Route - must be last route in list
// app.use(async (req, res, next) => {
//   next({ status: 404, message: "Sorry, we appear to have lost that page." });
// });

// /* ***********************
//  * Express Error Handler
//  * Place after all other middleware
//  *************************/
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500);
//   res.render("errors/error", { title: "Error", message: err.message });
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

/*******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const errorRoute = require("./routes/errorRoute");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
app.get("/", utilities.handleErrors(baseController.buildHome)); // Ensure this route is defined
app.use("/inv", inventoryRoute);
app.use("/error", errorRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  const nav = await utilities.getNav();
  res.status(err.status || 500);
  res.render("errors/error", { title: "Error", message: err.message, nav });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});