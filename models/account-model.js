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

/* ***********************
 * Check account credentials
 * ********************* */
async function checkAccountCredentials(account_email, account_password) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);

    if (result.rowCount > 0) {
      const account = result.rows[0];

      // If you're using bcrypt or another hashing library, compare hashed password here
      if (account_password === account.account_password) {
        return account; // Return the account if the credentials are correct
      } else {
        return null; // Return null if password doesn't match
      }
    } else {
      return null; // Return null if the email doesn't exist
    }
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Error checking account credentials");
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data by account ID
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Error in getAccountById:", error)
    return null
  }
}

/* *****************************
*  Update Account Information
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = 
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ]);
  } catch (error) {
    console.error("Update Account Error:", error);
    return error.message;
  }
}

/* *****************************
*  Update Password
* ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = 
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    return await pool.query(sql, [
      account_password,
      account_id
    ]);
  } catch (error) {
    console.error("Update Password Error:", error);
    return error.message;
  }
}


module.exports = {
  registerAccount,
  checkExistingEmail,
  checkAccountCredentials,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
