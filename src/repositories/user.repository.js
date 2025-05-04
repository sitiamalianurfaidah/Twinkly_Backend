const db = require("../database/pg.database");

exports.createUser = async (user) => {
    try {
        const res = await db.query(
            "INSERT INTO users (id, email, password, name, balance, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [user.id, user.email, user.password, user.name, user.balance, user.created_at]
        );
        return res.rows[0];
    } catch (error) {
        console.error("Error creating user", error);
    }
};

exports.getUser = async (email) => {
    try {
        const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } catch (error) {
        console.error("Error in getUserByEmail:", error);
        return null;
    }
};


exports.updateUser = async (user) => {
    try {
        const res = await db.query(
            "UPDATE users SET email = $1, password = $2, name = $3 WHERE id = $4 RETURNING *",
            [user.email, user.password, user.name, user.id]
        );
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error updating user", error);
    }
};

exports.deleteUser = async (id) => {
    try {
        const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error deleting user", error);
    }
};

exports.getUserBalance = async (user_id) => {
    try {
        const res = await db.query("SELECT balance FROM users WHERE id = $1", [user_id]);
        return res.rows.length > 0 ? res.rows[0].balance : null;
    } catch (error) {
        console.error("Error getting user balance", error);
        throw error;
    }
};

exports.getUserById = async (user_id) => {
    try {
        const res = await db.query("SELECT * FROM users WHERE id = $1", [user_id]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } catch (error) {
        console.error("Error getting user by ID:", error);
        throw error;
    }
};


exports.updateUserBalance = async (user_id, new_balance) => {
    try {
        const res = await db.query("UPDATE users SET balance = $1 WHERE id = $2 RETURNING *", [new_balance, user_id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error updating user balance", error);
        throw error;
    }
};
