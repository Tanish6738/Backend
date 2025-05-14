import mongoose, { isValidObjectId } from "mongoose";
import { likeModel } from "../models/likes.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import  asyncHandler from "../../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid video ID"));
    }

    const like = await likeModel.findOne({ video: videoId, likedBy: userId });
    if (like) {
        await likeModel.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, "Video unliked successfully"));
    } else {
        await likeModel.create({ video: videoId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid comment ID"));
    }

    const like = await likeModel.findOne({ comment: commentId, likedBy: userId });
    if (like) {
        await likeModel.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully"));
    } else {
        await likeModel.create({ comment: commentId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, "Comment liked successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid tweet ID"));
    }

    const like = await likeModel.findOne({ tweet: tweetId, likedBy: userId });
    if (like) {
        await likeModel.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully"));
    } else {
        await likeModel.create({ tweet: tweetId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, "Tweet liked successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const likedVideos = await likeModel.aggregate([
        { $match: { likedBy: mongoose.Types.ObjectId(userId), video: { $exists: true, $ne: null } } },
        { $lookup: { from: 'videos', localField: 'video', foreignField: '_id', as: 'videoDetails' } },
        { $unwind: '$videoDetails' },
        { $project: { 'videoDetails.owner.password': 0 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ]);
    return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};