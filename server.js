// /* ******************************************
//  * This server.js file is the primary file of the
//  * application. It is used to control the project.
//  *******************************************/

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
const session = require("express-session");
const pool = require("./database/");
const accountRoute = require('./routes/accountRoute'); 
const bodyParser = require("body-parser");



/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

app.use(require('connect-flash')()); // Initialize flash messages
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded






// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
});  


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root
app.use(express.static("public"));


/* ***********************
 * Routes
 *************************/
app.use(static);
app.get("/", utilities.handleErrors(baseController.buildHome)); // Ensure this route is defined
app.use("/inv", inventoryRoute);
app.use("/error", errorRoute);
app.use('/account', accountRoute); 

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
  res.render("errors/error", {
    title: "Error", // Add title here
    message: err.message,
    nav,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});