import {Router} from 'express';
import {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentUserPassword, getCurrentUser, updateUserAccount, updateUserAvatar, updateUserCoverImage, getChannelProfile, getUserWatchHistory  } from '../controllers/user.controller.js';
const router = Router();
import upload from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/Auth.middleware.js';

router.route('/register').post(
     upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1}
    ])
    ,registerUser
);
router.route('/login')
    .get((req,res)=>{
        res.send('Login page'); 
    })
    .post(loginUser);

// secure route
router.route('/logout').post(verifyJWT,logoutUser);

router.route('/refresh').post(refreshAccessToken);

router.route('/change-password').post(verifyJWT,changeCurrentUserPassword);

router.route('/me').get(verifyJWT,getCurrentUser);

router.route('/update-user').put(verifyJWT,updateUserAccount);

router.route('/update/avatar').put(verifyJWT,upload.single('avatar'),updateUserAvatar);

router.route('/update/cover-image').put(verifyJWT,upload.single('coverImage'),updateUserCoverImage);

router.route('/channel/:username').get(getChannelProfile);

router.route('/watch-history').get(verifyJWT,getUserWatchHistory);

export default router;