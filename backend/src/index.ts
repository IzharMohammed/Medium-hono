import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter'; // Import Hono's environment adapter
import { withAccelerate } from '@prisma/extension-accelerate'; // Import Prisma's Accelerate extension for optimization
import { PrismaClient } from '@prisma/client/edge'; // Import Prisma Client for database interactions

import { v2 as cloudinary } from 'cloudinary';
import { encodeBase64 } from 'hono/utils/encode';
import followRequestsRouter from './routes/followRequests';

const app = new Hono();
app.use('*', cors());


// app.use(async (_c, next) => {
//     // Configuration
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET 
//     });
//     await next();
// })

app.post("/upload", async (c) => {
    // Retrieve environment variables using the Hono adapter
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env<{
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_UPLOAD_PRESET: string;
    }>(c);

    // Parse the request body to extract the image file
    const body = await c.req.parseBody();
    const image = body['image'] as File;
    const byteArrayBuffer = await image.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);

    // Create a FormData object and append required fields
    const formData = new FormData();
    formData.append('file', `data:image/png;base64,${base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Add the upload preset

    // Send the POST request to Cloudinary using the FormData
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData // Use FormData instead of JSON.stringify
    });

    // Handle the response
    const results = await response.json();
    return c.json({ results });
});



app.get('/', (c) => c.text('Hello World!'));
app.get('/api/v1/allBlogs', async (c) => {
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());
    const blogs = await prisma.post.findMany();
    return c.json(blogs);
});

app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogsRouter);
app.route('api/v1/followRequests', followRequestsRouter);

export default app;
