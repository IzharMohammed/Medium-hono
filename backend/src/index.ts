import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello World!'));
app.route('api/v1/user', userRouter);
app.route('api/v1/blog',blogsRouter);

export default app;