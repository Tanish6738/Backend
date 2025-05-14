import mongoose, { isValidObjectId } from "mongoose"
import {tweetModel} from "../models/tweets.model.js"
import { userModel } from "../models/User.model.js"
import {ApiError} from "../../utils/ApiError.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import asyncHandler from "../../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        if (!req.body.content ) {
            return res.status(400).json(
                new ApiError(400, "Content is required")
            )
        }
        const tweet = new tweetModel({
            content: req.body.content.trim(),
            owner: req.user?._id
        })

        if (!tweet) {
            return res.status(400).json(
                new ApiError(400, "Invalid tweet data")
            )
        }
        await tweet.save()

        return res.status(201).json(
            new ApiResponse(201, "Tweet created successfully", tweet)
        )

    } catch (error) {
        return res.status(500).json(
            new ApiError(500, "Internal server error", error.message)
        )
    }
})


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
  
    const userTweets = await Tweet.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            { $project: { username: 1, "avatar.url": 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "tweet",
          as: "likes",
          pipeline: [
            { $project: { likedBy: 1 } },
          ],
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          isLiked: { $in: [req.user?._id, "$likes.likedBy"] },
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          owner: { $first: "$owner" }, 
          likesCount: 1,
          isLiked: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
  
    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"));
  });

  // Add ownership check for update and delete
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid tweet id");
    }
    if (!content.trim()) {
        throw new ApiError(401, "content must not be empty");
    }
    const tweet = await tweetModel.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    tweet.content = content;
    await tweet.save();
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }
    const tweet = await tweetModel.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    await tweetModel.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}