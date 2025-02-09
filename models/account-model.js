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

    return result.rows[0]; // Retorna o novo usuário criado
  } catch (error) {
    console.error("Database error:", error); // Log do erro no servidor
    throw new Error("Failed to register account"); // Lança uma exceção para ser capturada pelo controller
  }
}

module.exports = { registerAccount };
