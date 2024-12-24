import { ApiError } from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { userModel } from "../models/User.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("Received token:", token);
        
        if (!token) {
            throw new ApiError(401, "Authorization token is missing");
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // console.log("Decoded token:", decoded);
            
            const user = await userModel.findById(decoded._id).select("-password -refreshToken");
            // console.log("Found user:", user);

            if (!user) {
                throw new ApiError(401, "Invalid Access Token - User not found");
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.error("JWT Error:", jwtError);
            throw new ApiError(401, "Invalid Access Token");
        }
    } catch (error) {
        console.error("Auth Error:", error);
        next(error);
    }
});