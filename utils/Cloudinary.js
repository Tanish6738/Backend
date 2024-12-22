import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        // console.log("Uploaded to Cloudinary" , result);
        fs.unlinkSync(file);
        return result;
    } catch (error) {
        fs.unlinkSync(file);
        console.log("Error uploading to Cloudinary", error);
        return null;
    }
}

export { uploadOnCloudinary };