const db = require("../config/database");

class ProfilePicture {
  static async create(accountId, filePath) {
    const [result] = await db.execute(
      "INSERT INTO profile_pictures (account_id, file_path) VALUES (?, ?)",
      [accountId, filePath]
    );
    return result;
  }

  static async findByAccountId(accountId) {
    const [rows] = await db.execute(
      "SELECT * FROM profile_pictures WHERE account_id = ?",
      [accountId]
    );
    return rows[0];
  }

  static async update(accountId, filePath) {
    const [result] = await db.execute(
      "UPDATE profile_pictures SET file_path = ? WHERE account_id = ?",
      [filePath, accountId]
    );
    return result;
  }
}

module.exports = ProfilePicture;
