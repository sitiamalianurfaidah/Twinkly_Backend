const db = require("../database/pg.database");

exports.createUser = async (user) => {
    try {
        const res = await db.query(
            "INSERT INTO users (id, email, password, name, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user.id, user.email, user.password, user.name, user.created_at]
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

exports.deleteUser = async (id) => {
    try {
        const res = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error deleting user", error);
    }
};
