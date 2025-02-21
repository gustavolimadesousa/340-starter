const express = require("express");
const router = express.Router();
const ProfilePictureController = require("../controllers/ProfilePictureController");
const upload = require("../middleware/upload");

// Route to render the profile page
router.get("/profile", (req, res) => {
  const profilePicture = req.user ? req.user.profilePicture : null; // Or fetch from DB
  res.render("profile", { profilePicture });
});

// Route to handle the upload of a profile picture
router.post(
  "/profile/upload-picture",
  upload.single("profile-picture"),
  ProfilePictureController.uploadProfilePicture
);

module.exports = router;
