import mongoose, { isValidObjectId } from "mongoose";
import { userModel } from "../models/user.model.js";
import { subscriptionModel } from "../models/subscription.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid channel ID"));
    }

    const subscription = await subscriptionModel.findOne({ subscriber: subscriberId, channel: channelId });
    if (subscription) {
        await subscriptionModel.findByIdAndDelete(subscription._id);
        return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
    } else {
        await subscriptionModel.create({ subscriber: subscriberId, channel: channelId });
        return res.status(200).json(new ApiResponse(200, "Subscribed successfully"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid channel ID"));
    }

    const subscribers = await subscriptionModel.aggregate([
        { $match: { channel: mongoose.Types.ObjectId(channelId) } },
        { $lookup: { from: 'users', localField: 'subscriber', foreignField: '_id', as: 'subscriberDetails' } },
        { $unwind: '$subscriberDetails' },
        { $project: { 'subscriberDetails.password': 0 } }
    ]);

    return res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", subscribers));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        return res.status(400).json(new ApiResponse(400, "Invalid subscriber ID"));
    }

    const channels = await subscriptionModel.aggregate([
        { $match: { subscriber: mongoose.Types.ObjectId(subscriberId) } },
        { $lookup: { from: 'users', localField: 'channel', foreignField: '_id', as: 'channelDetails' } },
        { $unwind: '$channelDetails' },
        { $project: { 'channelDetails.password': 0 } }
    ]);

    return res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", channels));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};