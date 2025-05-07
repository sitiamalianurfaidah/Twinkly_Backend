const pool = require("../database/pg.database");

exports.createAffirmation = async (affirmation) => {
    const { id, message, created_at } = affirmation;

    const query = `
        INSERT INTO affirmations (id, message, created_at)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [id, message, created_at];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error("Error in getAffirmationsByUserId:", error);
        throw error;
    }
};

exports.getAllAffirmations = async () => {
    const query = `SELECT * FROM affirmations ORDER BY created_at DESC;`;

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

exports.deleteAffirmation = async (id) => {
    const query = `DELETE FROM affirmations WHERE id = $1 RETURNING *;`;

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
};
