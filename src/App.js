import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential : true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Routes Import 

import {router as userRouter} from "./routes/user.routes.js"
import {router as videoRouter} from "./routes/video.routes.js"
import {router as subscriptionRouter} from "./routes/subscription.routes.js"
import {router as tweetRouter} from "./routes/tweet.routes.js"
import {router as commentRouter} from "./routes/comment.routes.js"
import {router as likeRouter} from "./routes/like.routes.js"
import {router as dashboardRouter} from "./routes/dashboard.routes.js"
import {router as playlistRouter} from "./routes/playlist.routes.js"
import {router as healthRouter} from "./routes/health.routes.js"



// Routes Declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/playlists', playlistRouter);
app.use('/api/v1/health', healthRouter);


export default app;