const pool = require("../database/pg.database");
const { v4: uuidv4 } = require("uuid");

exports.createTransaction = async (transaction) => {
    try {
        await pool.query("BEGIN");
        await pool.query("SAVEPOINT create_transaction");

        // Cek ketersediaan item dan stok
        const itemRes = await pool.query("SELECT stock, price FROM items WHERE id = $1 FOR UPDATE", [transaction.item_id]);
        if (itemRes.rows.length === 0) {
            throw new Error("Item not found");
        }

        const { stock, price } = itemRes.rows[0];
        if (stock < transaction.quantity) {
            throw new Error("Insufficient stock");
        }

        // Hitung total harga transaksi
        const total = price * transaction.quantity;

        // Buat transaksi baru dengan ID unik
        const newTransactionId = uuidv4();
        const res = await pool.query(
            "INSERT INTO transactions (id, user_id, item_id, quantity, total, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
            [newTransactionId, transaction.user_id, transaction.item_id, transaction.quantity, total, 'pending']
        );

        // Kurangi stok item
        await pool.query("UPDATE items SET stock = stock - $1 WHERE id = $2", [transaction.quantity, transaction.item_id]);

        await pool.query("COMMIT");
        return res.rows[0];
    } catch (error) {
        await pool.query("ROLLBACK TO SAVEPOINT create_transaction");
        console.error("Error creating transaction:", error);
        throw error;
    }
};

exports.updateTransactionStatus = async (transaction_id, status) => {
    try {
        const res = await pool.query(
            "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
            [status, transaction_id]
        );
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error updating transaction status:", error);
        throw error;
    }
};

exports.getTransactionById = async (transaction_id) => {
    try {
        const res = await pool.query("SELECT * FROM transactions WHERE id = $1", [transaction_id]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } catch (error) {
        console.error("Error getting transaction by ID:", error);
        throw error;
    }
};

exports.getItemById = async (item_id) => {
    try {
        const res = await pool.query("SELECT * FROM items WHERE id = $1", [item_id]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } catch (error) {
        console.error("Error getting item by ID:", error);
        throw error;
    }
};

exports.payTransaction = async (user_id, transaction_id) => {
    try {
        await pool.query("BEGIN");
        await pool.query("SAVEPOINT pay_transaction");

        // Ambil transaksi
        const transactionRes = await pool.query("SELECT total FROM transactions WHERE id = $1 AND user_id = $2 FOR UPDATE", [transaction_id, user_id]);
        if (transactionRes.rowCount === 0) {
            throw new Error("Transaction not found");
        }
        const { total } = transactionRes.rows[0];

        // Cek saldo user
        const userRes = await pool.query("SELECT balance FROM users WHERE id = $1 FOR UPDATE", [user_id]);
        if (userRes.rowCount === 0) {
            throw new Error("User not found");
        }
        const { balance } = userRes.rows[0];

        if (balance < total) {
            throw new Error("Insufficient balance");
        }

        // Kurangi saldo user
        await pool.query(
            "UPDATE users SET balance = balance - $1 WHERE id = $2",
            [total, user_id]
        );

        // Perbarui status transaksi menjadi "paid"
        const updateTransactionRes = await pool.query(
            "UPDATE transactions SET status = 'paid' WHERE id = $1 RETURNING *",
            [transaction_id]
        );

        if (updateTransactionRes.rowCount === 0) {
            throw new Error("Transaction not found");
        }

        await pool.query("COMMIT");
        return updateTransactionRes.rows[0];
    } catch (error) {
        await pool.query("ROLLBACK TO SAVEPOINT pay_transaction");
        console.error("Error processing transaction payment:", error);
        throw error;
    }
};

exports.deleteTransaction = async (transaction_id) => {
    try {
        const res = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [transaction_id]);
        return res.rows[0] || null;
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
    }
};

exports.getAllTransactions = async () => {
    try {
        const res = await pool.query("SELECT * FROM transactions ORDER BY created_at DESC");
        return res.rows;
    } catch (error) {
        console.error("Error getting all transactions:", error);
        throw error;
    }
};
