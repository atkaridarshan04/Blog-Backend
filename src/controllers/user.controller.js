import Follower from '../models/follower.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';

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
    const { username, email, password, bio } = req.body;
    const profilePic = req.file ? req.file.path : null  // The Cloudinary URL

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

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find and soft delete the user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();  // Soft delete

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const followUser = async (req, res) => {
    const followingId = req.params.id;
    const followerId = req.user.id;

    try {
        const followingUser = await User.findByPk(followingId)
        if (!followingUser) return res.status(404).json({ message: "User not found" })

        const existingFollower = await Follower.findOne({ where: { followerId, followingId } })
        if (existingFollower) return res.status(400).json({ message: "You are already following this user" });

        await Follower.create({
            followerId,
            followingId
        })

        return res.status(201).json({ message: "User followed successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const unfollowUser = async (req, res) => {
    const followingId = req.params.id;
    const followerId = req.user.id;

    try {
        const followingUser = await User.findByPk(followingId);
        if (!followingUser) return res.status(404).json({ message: "User not found" });

        const existingFollower = await Follower.findOne({ where: { followerId, followingId } });
        if (!existingFollower) return res.status(400).json({ message: "You do not follow this user" });

        await existingFollower.destroy();

        return res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFollowerCount = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const followerCount = await Follower.count({ where: { followingId: userId } });

        return res.status(200).json({ message: "Follower count fetched successfully", followerCount });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getFollower = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        const followers = await Follower.findAll({ where: { followingId: userId } })
        if (followers.length === 0) return res.status(404).json({ message: "User does not have any follower" })

        return res.status(200).json({ message: "Followers fetched successfully", followers });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getFollowings = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const followings = await Follower.findAll({ where: { followerId: userId } });
        if (followings.length === 0) return res.status(404).json({ message: "User is not following anyone" });

        return res.status(200).json({ message: "Following users fetched successfully", followings });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUserProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const profilePicFile = req.file;  // The uploaded file
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete old image from Cloudinary if exists
        if (user.profilePicId) {
            await cloudinary.v2.uploader.destroy(user.profilePicId);
        }

        // Upload the new image to Cloudinary
        const uploadResponse = await cloudinary.v2.uploader.upload(profilePicFile.path);

        user.profilePicture = uploadResponse.secure_url;
        user.profilePicId = uploadResponse.public_id;
        await user.save();

        return res.status(200).json({ message: 'Profile picture updated successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserByUsername = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({
            where: { username }
        })
        if (!user) return res.status(404).json({ message: "No user found with this username" });

        return res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {   
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export { refreshAccessToken };

