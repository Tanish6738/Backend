import asyncHandler from "../../utils/asyncHandler.js";
import { userModel } from "../models/User.model.js";
import { subscriptionModel } from "../models/Subscription.model.js"
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim === "")) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const user = await userModel.findOne({
        $or: [{ email }, { username }],
    });

    if (user) {
        throw new ApiError(400, "User already exists");
    }

    console.log("Files received:", {
        avatarExists: !!req.files?.avatar,
        coverExists: !!req.files?.coverImage,
        avatarPath: req.files?.avatar?.[0]?.path,
        coverPath: req.files?.coverImage?.[0]?.path
    });

    if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarLocalPath = req.files.avatar[0].path;
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadedAvatar) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    let coverImageUrl = "";
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (coverLocalPath) {
        const uploadedCover = await uploadOnCloudinary(coverLocalPath);
        if (uploadedCover) {
            coverImageUrl = uploadedCover.url;
            console.log("Cover image uploaded successfully:", coverImageUrl);
        }
    }

    const newUser = await userModel.create({
        fullName,
        avatar: uploadedAvatar?.url || "",
        coverImage: coverImageUrl,
        username: username.toLowerCase(),
        email,
        password,
    });

    const findUser = await userModel.findById(newUser._id)
        .select("-password -refreshToken")
        .lean();

    if (!findUser) {
        throw new ApiError(500, "Error creating user");
    }

    console.log("User registration successful:", {
        username: findUser.username,
        hasAvatar: !!findUser.avatar,
        hasCover: !!findUser.coverImage
    });

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", findUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    console.log("Login request received:", { email, username, password });

    if ((!email && !username) || !password) {
        throw new ApiError(400, "Please provide either email or username, and password");
    }

    const user = await userModel.findOne({
        $or: [
            { email: email?.toLowerCase()?.trim() || "" },
            { username: username?.toLowerCase()?.trim() || "" }
        ]
    });

    console.log("User found:", user);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
});

const logoutUser = asyncHandler(async (req, res) => {
    await userModel.findByIdAndUpdate(
        req.user._id, {
        $set: { refreshToken: undefined },
        new: true
    });

    const option = {
        expires: new Date(Date.now() - 1000),
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(400, "Refresh token is required");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);

        if (!decodedToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const user = await userModel.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const option = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(500, "Error refreshing access token");
    }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            throw new ApiError(400, "Please provide old and new passwords");
        }

        const user = await userModel.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const isPasswordValid = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid password");
        }

        user.password = newPassword;
        await user.save({
            validateBeforeSave: false
        });

        return res.status(200).json(new ApiResponse(200, "Password changed successfully"));
    } catch (error) {
        throw new ApiError(500, "Error changing password");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, "User found", user));
});

const updateUserAccount = asyncHandler(async (req, res) => {
    const { fullName, email, username } = req.body;

    if (!fullName && !email && !username) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    if ([fullName, email, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const user = await userModel.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingUser = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        throw new ApiError(400, "User already exists");
    }

    user.fullName = fullName;
    user.email = email;
    user.username = username;

    await user.save({
        validateBeforeSave: false
    });

    return res.status(200).json(new ApiResponse(200, "User updated successfully", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarLocalPath = req.files.avatar[0].path;
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadedAvatar) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await userModel.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.avatar = uploadedAvatar.url;
    await user.save({
        validateBeforeSave: false
    });

    return res.status(200).json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    if (!req.files || !req.files.coverImage || !req.files.coverImage[0]) {
        throw new ApiError(400, "Cover image file is required");
    }

    const coverLocalPath = req.files.coverImage[0].path;
    const uploadedCover = await uploadOnCloudinary(coverLocalPath);

    if (!uploadedCover) {
        throw new ApiError(500, "Error while uploading cover image");
    }

    const user = await userModel.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.coverImage = uploadedCover.url;
    await user.save({
        validateBeforeSave: false
    });

    return res.status(200).json(new ApiResponse(200, "Cover image updated successfully", user));
});

const getChannelProfile = asyncHandler(async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new ApiError(400, "Please provide a username");
        }

        const user = await userModel.aggregate([
            {
                $match: {
                    username: username?.toLowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            }, {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribeTo"
                }
            }, {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    subscribeToCount: {
                        $size: "$subscribeTo"
                    },
                    isSubscribed: {
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }, {
                $project: {
                    fullName: 1,
                    username: 1,
                    email: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscriberCount: 1,
                    subscribeToCount: 1
                }
            }
        ]);

        console.log("Channel profile found:", user);

        if (!user.length) {
            throw new ApiError(404, "Channel profile not found");
        }

        return res.status(200).json(new ApiResponse(200, "Channel profile found", user));
    } catch (error) {
        throw new ApiError(500, "Error fetching channel profile");
    }
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUserAccount,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelProfile
};