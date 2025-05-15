import {Router} from 'express';
import {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentUserPassword, getCurrentUser, updateUserAccount, updateUserAvatar, updateUserCoverImage, getChannelProfile, getUserWatchHistory  } from '../controllers/user.controller.js';
const router = Router();
import upload from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/Auth.middleware.js';

// Register
router.route('/register').post(
     upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ])
    ,registerUser
);

// Login
router.route('/login')
    .get((req,res)=>{
        res.send('Login page'); 
    })
    .post(loginUser);

// Logout
router.route('/logout').post(verifyJWT,logoutUser);

// Refresh Access Token
router.route('/refresh-token').post(refreshAccessToken);

// Change Password
router.route('/change-password').patch(verifyJWT,changeCurrentUserPassword);

// Get Current User
router.route('/me').get(verifyJWT,getCurrentUser);

// Update User Account
router.route('/update').patch(verifyJWT,updateUserAccount);

// Update Avatar
router.route('/avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar);

// Update Cover Image
router.route('/cover-image').patch(verifyJWT,upload.single('coverImage'),updateUserCoverImage);

// Get Channel Profile
router.route('/channel/:username').get(getChannelProfile);

// Get User Watch History
router.route('/watch-history').get(verifyJWT,getUserWatchHistory);

export default router;