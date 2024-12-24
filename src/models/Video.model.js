import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema = new Schema({
    videoFile : {
        type : String,
        required : true
    },
    thumbnail : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    views : {
        type : Number,
        default : 0
    },  
    duration : {
        type : Number,
        required : true
    },
    likes : {
        type : Number,
        default : 0
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    isPublished : {
        type : Boolean,
        default : false
    }
}, {
    timestamps: true
});

export const videoModel = mongoose.model('Video', VideoSchema);