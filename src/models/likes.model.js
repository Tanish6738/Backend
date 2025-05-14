import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        default: null
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    }
}, {
    timestamps: true
});

// Ensure only one of comment, video, or tweet is set per like
LikeSchema.pre('save', function(next) {
    const fields = [this.comment, this.video, this.tweet].filter(Boolean);
    if (fields.length !== 1) {
        return next(new Error('Exactly one of comment, video, or tweet must be set.'));
    }
    next();
});

// Add indexes for performance
LikeSchema.index({ video: 1, likedBy: 1 });
LikeSchema.index({ comment: 1, likedBy: 1 });
LikeSchema.index({ tweet: 1, likedBy: 1 });

export const likeModel = mongoose.model('Like', LikeSchema);