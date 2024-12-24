import mongoose from "mongoose";
import { commentModel as Comment } from "../models/comment.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid video ID"));
    }

    const comments = await Comment.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDetails' } },
        { $unwind: '$ownerDetails' },
        { $project: { 'ownerDetails.password': 0 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ]);

    return res.status(200).json(new ApiResponse(200, "Comments fetched successfully", comments));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid video ID"));
    }

    const comment = await Comment.create({ video: videoId, content, owner: userId });

    return res.status(201).json(new ApiResponse(201, "Comment added successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid comment ID"));
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true, runValidators: true }
    );

    if (!comment) {
        return res.status(404).json(new ApiResponse(404, "Comment not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Comment updated successfully", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid comment ID"));
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        return res.status(404).json(new ApiResponse(404, "Comment not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};