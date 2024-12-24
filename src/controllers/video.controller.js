import mongoose, { isValidObjectId } from "mongoose";
import { videoModel as Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const match = {};
    if (query) {
        match.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        match.owner = mongoose.Types.ObjectId(userId);
    }

    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
    };

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            { $match: match },
            { $sort: sort },
            { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
            { $unwind: "$owner" },
            { $project: { "owner.password": 0 } }
        ]),
        options
    );

    return res.status(200).json(
        new ApiResponse(200, "Videos retrieved successfully", videos)
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile, thumbnail } = req.files;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, "User not found")
        );
    }

    const videoFileUrl = await uploadOnCloudinary(videoFile.tempFilePath);
    const thumbnailUrl = await uploadOnCloudinary(thumbnail.tempFilePath);

    const video = await Video.create({
        videoFile: videoFileUrl,
        thumbnail: thumbnailUrl,
        title,
        description,
        duration: 0,
        owner: userId
    });

    return res.status(201).json(
        new ApiResponse(201, "Video created successfully", video)
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiResponse(400, "Invalid video ID")
        );
    }

    const video = await Video.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(videoId) } },
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
        { $unwind: "$owner" },
        { $project: { "owner.password": 0 } }
    ]);

    if (!video.length) {
        return res.status(404).json(
            new ApiResponse(404, "Video not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, "Video retrieved successfully", video[0])
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiResponse(400, "Invalid video ID")
        );
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { title, description, thumbnail },
        { new: true, runValidators: true }
    );

    if (!video) {
        return res.status(404).json(
            new ApiResponse(404, "Video not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, "Video updated successfully", video)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiResponse(400, "Invalid video ID")
        );
    }

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json(
            new ApiResponse(404, "Video not found")
        );
    }

    await video.remove();

    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(
            new ApiResponse(400, "Invalid video ID")
        );
    }

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json(
            new ApiResponse(404, "Video not found")
        );
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, "Video publish status updated", video)
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
