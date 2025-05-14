import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
    getChannelEngagement,
    getTopVideos
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/Auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);
router.route("/engagement").get(getChannelEngagement);
router.route("/top-videos").get(getTopVideos);

export default router