import mongoose from "mongoose";
import { videoModel as Video } from "../models/video.model.js";
import { subscriptionModel } from "../models/subscription.model.js";
import { likeModel } from "../models/like.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid channel ID"));
    }

    const stats = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: "$likes" }
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscribers" }
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalVideos: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, "Channel stats fetched successfully", stats[0]));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid channel ID"));
    }

    const videos = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails" } },
        { $unwind: "$ownerDetails" },
        { $project: { "ownerDetails.password": 0 } }
    ]);

    return res.status(200).json(new ApiResponse(200, "Channel videos fetched successfully", videos));
});

export {
    getChannelStats,
    getChannelVideos
};