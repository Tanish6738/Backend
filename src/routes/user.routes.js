import {Router} from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken } from '../controllers/user.controller.js';
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
router.route('/login').post(loginUser);

// secure route
router.route('/logout').post(verifyJWT,logoutUser);

router.route('/refresh').post(refreshAccessToken);

export default router;