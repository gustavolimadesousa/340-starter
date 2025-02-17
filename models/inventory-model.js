
const pool = require("../database/");


async function getClassifications() {
  try {
    const result = await pool.query("SELECT classification_id, classification_name FROM classification");
    return result.rows; // Certifique-se de que está retornando os dados corretamente
  } catch (error) {
    console.error("Error fetching classifications:", error);
    return [];
  }
}


// // Get all classification data
// async function getClassifications() {
//   return await pool.query(
//     "SELECT * FROM public.classification ORDER BY classification_name"
//   );
// }

// async function getClassifications() {
//   try {
//     const result = await pool.query(
//       "SELECT classification_id, classification_name FROM classification ORDER BY classification_name"
//     );
//     return result; // Return the full query result object
//   } catch (error) {
//     console.error("Error fetching classifications:", error);
//     return { rows: [] }; // Mimic the structure even in errors
//   }
// }



// Get all inventory items and classification_name by classification_id
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
}

// Get specific vehicle by ID
async function getVehicleById(invId) {
  try {
    const query = `
      SELECT * FROM public.inventory
      WHERE inv_id = $1
    `;
    const data = await pool.query(query, [invId]);
    return data.rows[0]; // Return the first result
  } catch (error) {
    console.error("getVehicleById error: " + error);
    throw error;
  }
}

// Add a new classification
async function addClassification(classification_name) {
  try {
    const query = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await pool.query(query, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

async function addInventory(invData) {
  try {
    const sql = `INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_year,
      inv_description, inv_image, inv_thumbnail, inv_price,
      inv_miles, inv_color
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`;

    return await pool.query(sql, [
      invData.classification_id,
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
    ]);
  } catch (error) {
    console.error("Add inventory error:", error);
    throw error;
  }
}

// Get inventory item by ID (for editing)
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error: " + error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  getInventoryById,
};
