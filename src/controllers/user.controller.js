const userRepository = require("../repositories/user.repository");
const baseResponse = require("../utils/baseResponse.utils");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,}$/;

exports.registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return baseResponse(res, false, 400, "Email, password, and name are required", null);
    }
    if (!emailRegex.test(email)) {
        return baseResponse(res, false, 400, "Invalid email format", null);
    }

    if (!passwordRegex.test(password)) {
        return baseResponse(res, false, 400, "Invalid password format", null);
    }

    try {
        const existingUser = await userRepository.getUser(email);
        
        if (existingUser) {
            return baseResponse(res, false, 400, "Email already used", null);
        }
        //NO 2
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,   
            name,
            balance: 0,
            created_at: new Date(),
        };

        const createdUser = await userRepository.createUser(newUser);
        return baseResponse(res, true, 201, "User created", newUser);
    } catch (error) {
        return baseResponse(res, false, 500, "User not found", null);
    } 
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userRepository.getUser(email);

        // NO 3: Bandingkan password hash dengan input user
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }

        baseResponse(res, true, 200, "Login success", user);
    } catch (error) {
        baseResponse(res, false, 500, "User not found", null);
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await userRepository.getUser(req.params.email);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        baseResponse(res, true, 200, "User found", user);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving user", error);
    }
};

exports.updateUser = async (req, res) => {
    const { id, email, password, name } = req.body;
    if (!id || !email || !password || !name) {
        return baseResponse(res, false, 400, "Missing required fields", null);
    }

    try {
        // Hash password baru sebelum update
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userRepository.updateUser({ 
            id, 
            email, 
            password: hashedPassword,  // Simpan password yang sudah di-hash
            name 
        });
        if (!updatedUser) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        baseResponse(res, true, 200, "User updated", updatedUser);
    } catch (error) {
        baseResponse(res, false, 500, "Error updating user", error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await userRepository.deleteUser(req.params.id);
        if (!deletedUser) {
            return baseResponse(res, false, 404, "User not found", null);
        }
        baseResponse(res, true, 200, "User deleted", deletedUser);
    } catch (error) {
        baseResponse(res, false, 500, "Error deleting user", error);
    }
};

exports.topUpBalance = async (req, res) => {
    const { email, amount } = req.body;

    try {
        const user = await userRepository.getUser(email);
        if (!user) {
            return baseResponse(res, false, 404, "User not found", null);
        }

        const newBalance = user.balance + amount;
        await userRepository.updateBalance(email, newBalance);

        baseResponse(res, true, 200, "Balance updated", { email, newBalance });
    } catch (error) {
        baseResponse(res, false, 500, "User not found", null);
    }
};


