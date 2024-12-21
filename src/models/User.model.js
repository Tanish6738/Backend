import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcryt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase : true,
        trim: true,
        index : true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase : true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index : true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    avatar: {
        type: String, // Cloudinary URL
        default: ''
    },
    coverImage: {
        type: String, 
        default: ''
    },
    watchHistory : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    refreshToken: {
        type: String,
        default: ''
    }
},{
    timestamps: true
});

userSchema.pre("save", async function(next){
    if(this.isModified('password')){
        this.password = await bcryt.hash(this.password, 8);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcryt.compare(password, this.password);
}

userSchema.methods.generateToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        fullName: this.fullName,
        avatar: this.avatar
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d'}); 
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'}); 
}

export const userModel = mongoose.model('User', userSchema);