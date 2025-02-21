const ProfilePicture = require("../models/ProfilePicture");
const fs = require("fs");
const path = require("path");

exports.uploadProfilePicture = async (req, res) => {
  const accountId = req.user.account_id; // Using account_id to reference the user
  const file = req.file;

  if (!file) {
    req.flash("error", "No file uploaded.");
    return res.redirect("/profile");
  }

  const filePath = `/uploads/${file.filename}`;

  try {
    const existingPicture = await ProfilePicture.findByAccountId(accountId);

    if (existingPicture) {
      // Delete the old file
      fs.unlinkSync(
        path.join(__dirname, "../public", existingPicture.file_path)
      );
      await ProfilePicture.update(accountId, filePath);
    } else {
      await ProfilePicture.create(accountId, filePath);
    }

    req.flash("success", "Profile picture updated successfully!");
  } catch (error) {
    req.flash("error", "Failed to update profile picture.");
  }

  res.redirect("/profile");
};
