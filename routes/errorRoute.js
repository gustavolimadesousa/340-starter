// const express = require("express");
// const router = new express.Router();

// router.get("/", (req, res) => {
//   res.render("errors/error", { title: "Error", message: "An error occurred" });
// });

// module.exports = router;

const express = require("express");
const router = new express.Router();
const errorController = require("../controllers/errorController");

router.get("/", (req, res) => {
  res.render("errors/error", { title: "Error", message: "An error occurred" });
});

// Route to trigger an intentional error
router.get("/trigger-error", errorController.triggerError);

module.exports = router;
