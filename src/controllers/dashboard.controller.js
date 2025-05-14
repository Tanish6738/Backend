import mongoose, { isValidObjectId } from "mongoose";
import { likeModel } from "../models/likes.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import  asyncHandler from "../../utils/asyncHandler.js";
import { subscriptionModel } from "../models/Subscription.model.js";
import { videoModel } from "../models/Video.model.js";
import { commentModel } from "../models/comment.model.js";

// Utility: Pagination helper
function getPagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

// Utility: Analytics helper (example: trending videos)
async function getTrendingVideos(limit = 5) {
    return videoModel.find({ isPublished: true })
        .sort({ views: -1, createdAt: -1 })
        .limit(limit)
        .select("title thumbnail views owner createdAt")
        .populate("owner", "username avatar");
}

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    // Aggregate stats
    const [stats] = await videoModel.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        {
            $group: {
                _id: "$owner",
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: "$likes" }
            }
        }
    ]);
    // Subscriber count
    const totalSubscribers = await subscriptionModel.countDocuments({ channel: channelId });
    // Recent videos
    const recentVideos = await videoModel.find({ owner: channelId, isPublished: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title thumbnail views createdAt");
    // Trending videos (site-wide)
    const trendingVideos = await getTrendingVideos(5);
    return res.status(200).json(new ApiResponse(200, "Channel stats fetched successfully", {
        totalViews: stats?.totalViews || 0,
        totalVideos: stats?.totalVideos || 0,
        totalLikes: stats?.totalLikes || 0,
        totalSubscribers,
        recentVideos,
        trendingVideos
    }));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const { page, limit, skip } = getPagination(req.query);
    // Search and sort support
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;
    const match = {
        owner: mongoose.Types.ObjectId(channelId),
        isPublished: true,
        ...(search && { title: { $regex: search, $options: "i" } })
    };
    const videos = await videoModel.find(match)
        .sort({ [sortBy]: sortType })
        .skip(skip)
        .limit(limit)
        .populate("owner", "username avatar")
        .select("title thumbnail views likes createdAt");
    const total = await videoModel.countDocuments(match);
    return res.status(200).json(new ApiResponse(200, "Channel videos fetched successfully", {
        videos,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total
    }));
});

// New: Get channel engagement analytics (likes, comments, views over time)
const getChannelEngagement = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    // Daily views
    const dailyViews = await videoModel.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId), createdAt: { $gte: thirtyDaysAgo } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: "$views" }
        } },
        { $sort: { _id: 1 } }
    ]);
    // Daily comments (only for this channel's videos)
    const channelVideoIds = await videoModel.find({ owner: channelId }).distinct('_id');
    const dailyComments = await commentModel.aggregate([
        { $match: { video: { $in: channelVideoIds }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            comments: { $sum: 1 }
        } },
        { $sort: { _id: 1 } }
    ]);
    return res.status(200).json(new ApiResponse(200, "Channel engagement analytics fetched successfully", { dailyViews, dailyComments }));
});

// New: Get top videos for a channel
const getTopVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const topVideos = await videoModel.find({ owner: channelId, isPublished: true })
        .sort({ views: -1 })
        .limit(10)
        .select("title thumbnail views likes createdAt");
    return res.status(200).json(new ApiResponse(200, "Top videos fetched successfully", topVideos));
});

export {
    getChannelStats,
    getChannelVideos,
    getChannelEngagement,
    getTopVideos
};