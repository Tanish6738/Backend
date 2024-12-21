import asyncHandler from "../../utils/asyncHandler.js";
import { userModel } from "../models/User.model.js";
import {ApiError} from "../../utils/ApiError.js";
import {uploadOnCloudinary} from "../../utils/Cloudinary.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    const {fullName, username , email , password } = req.body;
    if ([
        fullName,email, username,password
    ].some((field) => field?.trim === "")) {
        throw new ApiError(400, "Please fill all the fields");
    }
    const user = await userModel.findOne({
        $or: [{ email }, { username }],
    });

    if (user) {
        throw new ApiError(400, "User already exists");
    }

    const avatarLocalPath =  req.files?.avatar[0]?.path || null;   ;
    const coverLocalPath = req.files?.cover[0]?.path || null;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an avatar image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const cover = await uploadOnCloudinary(coverLocalPath);

    if (!avatar ) {
        throw new ApiError(500, "Error uploading images");
    }

    const newUser = await userModel.create({
        fullName,
        avatar : avatar.url,
        cover : cover?.url || "",
        username : username.toLowerCase(),
        email,
        password,
    });

    const findUser = await userModel.findById(newUser._id).select("-password -refreshToken");

    if (!findUser) {
        throw new ApiError(500, "Error creating user");
    }

    return new ApiResponse(201, "User created successfully", findUser);
});

const loginUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "User logged in successfully" });
});




export { registerUser , loginUser};