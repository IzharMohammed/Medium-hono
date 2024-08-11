import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';

userRouter.use('api/v1/user');
blogsRouter.use('api/v1/blog');
