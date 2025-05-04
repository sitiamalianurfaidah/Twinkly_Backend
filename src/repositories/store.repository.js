const db = require("../database/pg.database");

exports.getAllStores = async () => {
    try {
        const res = await db.query("SELECT * FROM stores");
        return res.rows;
    } catch (error) {
        console.error("Error executing query", error);
        throw new Error("Database query error");
    }
};

exports.createStore = async (store) => {
    try {
        const res = await db.query(
            "INSERT INTO stores (name, address) VALUES ($1, $2) RETURNING *", 
            [store.name, store.address]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error executing query", error);
        throw new Error("Failed to create store");
    }
};

exports.getStore = async (id) => {
    try {
        const res = await db.query("SELECT * FROM stores WHERE id = $1", [id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error executing query", error);
        throw new Error("Failed to retrieve store");
    }
};

exports.updateStore = async (store) => {
    try {
        const check = await db.query("SELECT * FROM stores WHERE id = $1", [store.id]);
        if (check.rowCount === 0) {
            return null; // Jika store tidak ditemukan
        }
        const res = await db.query(
            "UPDATE stores SET name = $1, address = $2 WHERE id = $3 RETURNING *",
            [store.name, store.address, store.id]
        );
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error executing query", error);
        throw new Error("Failed to update store");
    }
};

exports.deleteStore = async (id) => {
    try {
        const res = await db.query(
            "DELETE FROM stores WHERE id = $1 RETURNING *",
            [id]
        );
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error executing query", error);
        throw new Error("Failed to delete store");
    }
};