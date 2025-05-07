const userRepository = require("../repositories/user.repository");
const baseResponse = require("../utils/baseResponse.utils");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,}$/;

exports.signupUser = async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return baseResponse(res, false, 400, "Email, password, and name are required", null);
    }
    if (!emailRegex.test(email)) {
        return baseResponse(res, false, 400, "Invalid email format", null);
    }
    if (!passwordRegex.test(password)) {
        return baseResponse(res, false, 400, 
            "Password must be at least 8 characters long, contain at least one number and one special character (@, #, $, %, ^, &, *)", 
            null
        );
    }
    
    

    try {
        const existingUser = await userRepository.getUser(email);
        
        if (existingUser) {
            return baseResponse(res, false, 400, "Email already used", null);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,   
            name,
            created_at: new Date(),
        };

        const createdUser = await userRepository.createUser(newUser);
        return baseResponse(res, true, 201, "User created", createdUser);
    } catch (error) {
        return baseResponse(res, false, 500, "Internal server error", null);
    } 
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userRepository.getUser(email);
        if (!user) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return baseResponse(res, false, 401, "Invalid email or password", null);
        }

        baseResponse(res, true, 200, "Login success", user);
    } catch (error) {
        console.error(error);
        baseResponse(res, false, 500, "Internal server error", error);
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
