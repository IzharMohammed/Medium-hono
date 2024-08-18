import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';
import { Hono } from 'hono';
import { v2 as cloudinary } from 'cloudinary';
import { encodeBase64 } from 'hono/utils/encode';

const app = new Hono();
/* app.use(async (_c, next) => {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    await next();
}) */

app.post("/upload",(c)=>
    c.req.parseBody().then(async (body) => {
        const image = body['image'] as File;
        const byteArrayBuffer = await image.arrayBuffer();
        const base64 = encodeBase64(byteArrayBuffer);
      //  const results = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`);
        //console.log('results', results);
       // return c.json({ results });

    })
)

app.get('/', (c) => c.text('Hello World!'));
app.route('api/v1/user', userRouter);
app.route('api/v1/blog', blogsRouter);

export default app;