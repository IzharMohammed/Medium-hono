import { v2 as cloudinary } from 'cloudinary';

async function cloudinaryUpload(fileUri: any) {

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            fileUri, {
            public_id: 'shoes',
            resource_type: 'auto'
        }
        )
        .catch((error) => {
            console.log(error);
        });

    console.log('file uploaded on cloudinary', uploadResult);

};

export default cloudinaryUpload;