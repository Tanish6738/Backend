import mongoose , {Schema}from "mongoose";

const LikeSchema = new Schema({
   
    comment : {
        type : Schema.Types.ObjectId,
        ref : 'Comment',
    },
    video : {
        type : Schema.Types.ObjectId,
        ref : 'Video',
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : 'User',
    },
    tweetBy : {
        type : Schema.Types.ObjectId,
        ref : 'User',
    }
},{
    timestamps : true
});

export const likeModel = mongoose.model('Like', LikeSchema);