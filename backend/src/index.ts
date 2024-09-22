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
app.use('*', cors())

// app.use(async (_c, next) => {
//     // Configuration
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });
//     await next();
// })

// app.post("/upload", (c) =>
//     c.req.parseBody().then(async (body) => {
//         const image = body['image'] as File;
//         const byteArrayBuffer = await image.arrayBuffer();
//         const base64 = encodeBase64(byteArrayBuffer);
//         //  const results = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`);
//         //console.log('results', results);
//         // return c.json({ results });

//     })
// )

app.get('/', (c) => c.text('Hello World!'));
app.get('/api/v1/allBlogs', async (c) => {
    // Get the database URL from environment variables using the Hono adapter
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    // Initialize Prisma Client with the Accelerate extension using the database URL
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());
    const blogs = (await prisma.post.findMany());

    return c.json(blogs)
})
app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogsRouter);
app.route('api/v1/followRequests',followRequestsRouter);


export default app;