import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter'; // Import Hono's environment adapter
import { withAccelerate } from '@prisma/extension-accelerate'; // Import Prisma's Accelerate extension for optimization
import { PrismaClient } from '@prisma/client/edge'; // Import Prisma Client for database interactions
import followRequestsRouter from './routes/followRequests';

const app = new Hono();
app.use('*', cors());


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
