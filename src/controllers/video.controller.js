import mongoose, { isValidObjectId } from "mongoose";
import { videoModel } from "../models/Video.model.js";
import { userModel } from "../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import  asyncHandler from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/Cloudinary.js";
import fs from 'fs';

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const match = {};
    if (query) {
        match.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        match.owner = mongoose.Types.ObjectId(userId);
    }

    // Only add sort key if sortBy is provided and not empty, otherwise default to _id
    let sort = {};
    if (sortBy && typeof sortBy === 'string' && sortBy.trim() !== "") {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
        sort = { _id: -1 }; // Default sort by newest
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort
    };

    const aggregationPipeline = [
        { $match: match },
    ];
    // Always push $sort (guaranteed to have at least one key)
    aggregationPipeline.push({ $sort: sort });
    aggregationPipeline.push(
        { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } },
        { $unwind: "$owner" },
        { $project: { "owner.password": 0 } }
    );

    const videos = await videoModel.aggregatePaginate(
        videoModel.aggregate(aggregationPipeline),
        options
    );

    return res.status(200).json(
        new ApiResponse(200, "Videos retrieved successfully", videos)
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        return res.status(400).json(
            new ApiResponse(400, "Both videoFile and thumbnail are required.")
        );
    }
    // Handle both array and single file for videoFile and thumbnail
    let videoFile = req.files.videoFile;
    let thumbnail = req.files.thumbnail;
    if (Array.isArray(videoFile)) videoFile = videoFile[0];
    if (Array.isArray(thumbnail)) thumbnail = thumbnail[0];
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, "User not found")
        );
    }

    console.log('videoFile:', videoFile);
    console.log('thumbnail:', thumbnail);
    console.log('videoFile.path:', videoFile.path);
    console.log('thumbnail.path:', thumbnail.path);
    console.log('videoFile exists:', fs.existsSync(videoFile.path));
    console.log('thumbnail exists:', fs.existsSync(thumbnail.path));

    const videoFileUrl = await uploadOnCloudinary(videoFile.path);
    const thumbnailUrl = await uploadOnCloudinary(thumbnail.path);

    if (!videoFileUrl?.url || !thumbnailUrl?.url) {
        return res.status(500).json(
            new ApiResponse(500, `File upload failed. videoFileUrl: ${videoFileUrl?.url}, thumbnailUrl: ${thumbnailUrl?.url}`)
        );
    }

    const video = await videoModel.create({
        videoFile: videoFileUrl.url,
        thumbnail: thumbnailUrl.url,
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

    const video = await videoModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
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
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await videoModel.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, "Video updated successfully", video)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await videoModel.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
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

    const video = await videoModel.findById(videoId);
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
