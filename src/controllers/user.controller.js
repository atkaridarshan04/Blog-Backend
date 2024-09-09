import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};


export const registerUser = async (req, res) => {
    const { username, email, password, bio, profilePic } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user
        const newUser = await User.create({
            username,
            email,
            password,
            bio,
            profilePic,
        });

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: `User with ${email} not registered` });
        }

        // Verify the password
        const isPasswordMatched = await user.isPasswordMatched(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user.id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res.status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({ message: "User logged in successfully", user, refreshToken, accessToken });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
