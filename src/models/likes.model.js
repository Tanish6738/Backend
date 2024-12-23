import mongoose , {Schema}from "mongoose";

const LikeSchema = new Schema({
   
    comment : {
        type : Schema.Types.ObjectId,
        ref : 'Comment',
        required : true
    },
    video : {
        type : Schema.Types.ObjectId,
        ref : 'Video',
        required : true
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    tweetBy : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
},{
    timestamps : true
});

export const likeModel = mongoose.model('Like', LikeSchema);