const transactionRepository = require("../repositories/transaction.repository");
const userRepository = require("../repositories/user.repository");
const baseResponse = require("../utils/baseResponse.utils");
const { v4: uuidv4 } = require("uuid");

exports.createTransaction = async (req, res) => {
    const { user_id, item_id, quantity } = req.body;

    try {
        const item = await transactionRepository.getItemById(item_id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        if (item.stock < quantity) {
            return baseResponse(res, false, 400, "Insufficient stock", null);
        }

        const total = item.price * quantity;

        const newTransaction = {
            id: uuidv4(),
            user_id,
            item_id,
            quantity,
            total,
            status: "pending",
            created_at: new Date(),
        };

        const createdTransaction = await transactionRepository.createTransaction(newTransaction);
        return baseResponse(res, true, 201, "Transaction created", createdTransaction);
    } catch (error) {
        return baseResponse(res, false, 500, "Error creating transaction", { error: error.message });
    }
};

exports.payTransaction = async (req, res) => {
    const { transaction_id, user_id } = req.body;

    // Validasi input
    if (!transaction_id || !user_id) {
        return baseResponse(res, false, 400, "Transaction ID and User ID are required");
    }

    try {
        // Ambil transaksi berdasarkan ID
        const transaction = await transactionRepository.getTransactionById(transaction_id);
        if (!transaction) {
            return baseResponse(res, false, 404, "Transaction not found", null);
        }
        if (transaction.status !== "pending") {
            return baseResponse(res, false, 400, "Transaction is not pending", null);
        }

        // Ambil data user
        const user = await userRepository.getUserById(user_id);
        if (!user) {
            return baseResponse(res, false, 404, "User not found");
        }

        // Cek saldo user
        if (user.balance < transaction.total) {
            return baseResponse(res, false, 400, "Insufficient balance", null);
        }

        // Proses pembayaran
        const success = await transactionRepository.payTransaction(user_id, transaction_id, transaction.total);
        if (!success) {
            return baseResponse(res, false, 500, "Failed to process transaction", null);
        }

        // Ambil transaksi setelah di-update
        const updatedTransaction = await transactionRepository.getTransactionById(transaction_id);

        return baseResponse(res, true, 200, "Transaction paid successfully", updatedTransaction);
    } catch (error) {
        return baseResponse(res, false, 500, "Error processing payment", { error: error.message });
    }
};


exports.deleteTransaction = async (req, res) => {
    try {
        const deletedTransaction = await transactionRepository.deleteTransaction(req.params.id);
        if (!deletedTransaction) {
            return baseResponse(res, false, 404, "Transaction not found", null);
        }
        return baseResponse(res, true, 200, "Transaction deleted", deletedTransaction);
    } catch (error) {
        return baseResponse(res, false, 500, "Error deleting transaction", { error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionRepository.getAllTransactions();
        return baseResponse(res, true, 200, "Transactions retrieved successfully", transactions);
    } catch (error) {
        return baseResponse(res, false, 500, "Error fetching transactions", { error: error.message });
    }
};
