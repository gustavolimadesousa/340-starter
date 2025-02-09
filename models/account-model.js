const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);

    return result.rows[0]; // Return the newly created user
  } catch (error) {
    console.error("Database error:", error); // Log the error on the server
    throw new Error("Failed to register account"); // Throw an exception to be handled by the controller
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount; // Return the number of emails found
  } catch (error) {
    console.error("Database error:", error);
    return error.message;
  }
}

module.exports = { registerAccount, checkExistingEmail };
