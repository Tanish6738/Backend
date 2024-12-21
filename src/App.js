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

import userRouter from "./routes/user.routes.js"



// Routes Declaration
app.use('/api/v1/users', userRouter);


export default app;