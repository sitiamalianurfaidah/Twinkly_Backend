const pool = require("../database/pg.database");

exports.createItem = async (item) => {
    const { id, name, price, store_id, image_url, stock, created_at } = item;

    const query = `
        INSERT INTO items (id, name, price, store_id, image_url, stock, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const values = [id, name, price, store_id, image_url, stock, created_at];
    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            throw new Error("Failed to insert item");
        }
        console.log("✅ Query result:", result.rows[0]);
        return result.rows[0]; 
    } catch (error) {
        console.error("❌ Database Error:", error);
        throw new Error("Missing required fields");
    }
};

exports.getItems = async () => {
    const query = `SELECT * FROM items ORDER BY created_at DESC;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

exports.getItemById = async (id) => {
    const query = `SELECT * FROM items WHERE id = $1;`;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

exports.getItemsByStoreId = async (store_id) => {
    const query = `SELECT * FROM items WHERE store_id = $1 ORDER BY created_at DESC;`;
    try {
        const result = await pool.query(query, [store_id]);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

exports.updateItem = async (id, updatedFields) => {
    const fields = Object.keys(updatedFields);
    const values = Object.values(updatedFields);

    if (fields.length === 0) {
        return null; // Tidak ada field yang diupdate
    }
    
    values.push(id); // Tambahkan ID sebagai parameter terakhir untuk WHERE clause
    const setQuery = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    try {
        const existingItem = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
        if (existingItem.rowCount === 0) {
            return null; // Item tidak ditemukan
        }

        const query = `UPDATE items SET ${setQuery} WHERE id = $${values.length} RETURNING id, name, price, store_id, image_url, stock, created_at; `;
        const result = await pool.query(query, values);

        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

exports.deleteItem = async (id) => {
    const query = `DELETE FROM items WHERE id = $1 RETURNING *;`;
    try {
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return null; 
        }
        return result.rows.length ? result.rows[0] : null;
    } catch (error) {
        throw error;
    }
};
