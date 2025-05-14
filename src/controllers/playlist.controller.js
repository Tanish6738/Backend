import mongoose, { isValidObjectId } from "mongoose";
import { playlistModel } from "../models/playlist.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import  asyncHandler from "../../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    const playlist = await playlistModel.create({ name, description, owner: userId });

    return res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid user ID"));
    }

    const playlists = await playlistModel.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDetails' } },
        { $unwind: '$ownerDetails' },
        { $project: { 'ownerDetails.password': 0 } }
    ]);

    return res.status(200).json(new ApiResponse(200, "User playlists fetched successfully", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid playlist ID"));
    }

    const playlist = await playlistModel.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(playlistId) } },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDetails' } },
        { $unwind: '$ownerDetails' },
        { $project: { 'ownerDetails.password': 0 } }
    ]);

    if (!playlist.length) {
        return res.status(404).json(new ApiResponse(404, "playlist not found"));
    }

    return res.status(200).json(new ApiResponse(200, "playlist fetched successfully", playlist[0]));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid playlist or video ID"));
    }

    const playlist = await playlistModel.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, "playlist not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid playlist or video ID"));
    }

    const playlist = await playlistModel.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, "playlist not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playlist));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid playlist ID"));
    }

    const playlist = await playlistModel.findByIdAndDelete(playlistId);

    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, "playlist not found"));
    }

    return res.status(200).json(new ApiResponse(200, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid playlist ID"));
    }

    const playlist = await playlistModel.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true, runValidators: true }
    );

    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, "Playlist not found"));
    }

    return res.status(200).json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};