import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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
            sameSite: 'strict'
        };

        return res.status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json({ message: "User logged in successfully", user, refreshToken, accessToken });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        await User.update(
            { refreshToken: null }, // Remove the refresh token
            { where: { id: req.user.id } } // Update by user ID
        );

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        };

        // Clear the cookies for accessToken and refreshToken
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({ message: 'Unauthorized request' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id); // Use findByPk for Sequelize

        if (!user) {
            return res.status(404).json({ message: 'Invalid refresh token' });
        }

        // Check if the refresh token matches
        if (user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        // Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        // Send response with new tokens
        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({
                status: 200,
                data: { accessToken, refreshToken },
                message: 'Access token refreshed successfully'
            });
    } catch (error) {
        return res.status(401).json({ message: error.message || 'Invalid refresh token' });
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordMatched = await user.isPasswordMatched(currentPassword);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getCurrentUser = async (req, res) => {
    return res.status(200).json({ message: "User fetched successfully", user: req.user })
}

export const updateAccountDetails = async (req, res) => {
    const { username, email, bio, profilePic } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update only the fields that are provided in the request
        if (username) user.username = username;
        if (email) user.email = email;
        if (bio) user.bio = bio;
        if (profilePic) user.profilePic = profilePic;

        await user.save({ validateBeforeSave: false });

        // Remove password from the user object
        const { password, ...userWithoutPassword } = user.toJSON();

        return res.status(200).json({
            message: "Account details updated successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


export { refreshAccessToken };

