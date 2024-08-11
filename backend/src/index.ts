import { userRouter } from './routes/users';
import blogsRouter from './routes/blogs';
import { Hono } from 'hono';
import { verify } from 'hono/jwt';

const app = new Hono();


app.get('/', (c) => c.text('Hello World!'));
app.route('api/v1/user', userRouter);
app.route('api/v1/blog',blogsRouter);

export default app;
// import { withAccelerate } from '@prisma/extension-accelerate'
// import { Hono } from 'hono';
// import { env } from 'hono/adapter'
// const jwtPassword = 'secret';
// import {decode, sign, verify } from 'hono/jwt';
// import { PrismaClient } from '@prisma/client/edge'
// const app = new Hono()
// import { z as zod } from 'zod';

// type responsePayload = {
//   email: string,
//   id: number
// }
// // app.use('/api/v1/blog/*', async (c, next) => {
// //   const token = c.req.header('token');
// //   if (!token) {
// //     return c.json({
// //       msg: 'Token needed',
// //     });
// //   }
// //   try {
// //     const response = await verify(token, jwtPassword) as responsePayload;
// //     const id = response.id;
// //     console.log(response);
// //     // c.header('response', email);
// //     c.set('jwtPayload', id)
// //     await next();
// //   } catch (error) {
// //     return c.json({
// //       msg: 'Invalid token',
// //     }, 401);
// //   }
// // });

// app.get('/', (c) => c.text('Hello World!'));

// app.post('/api/v1/user/signup', async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   const email = c.req.header('email');
//   const password = c.req.header('password');
//   const emailSchema = zod.string().email();
//   const passwordSchema = zod.string().min(4);
//   if (!email || !password) {
//     return c.json({
//       msg: 'Email and password are necessary'
//     });
//   }
//   const emailResponse = emailSchema.safeParse(email);
//   const passwordResponse = passwordSchema.safeParse(password);
//   if (!emailResponse.success) {
//     return c.json({
//       msg: 'Invalid email'
//     })
//   }
//   if (!passwordResponse.success) {
//     return c.json({
//       msg: 'Password must be minimum 4 characters'
//     })
//   }
//   const response = await prisma.user.create({
//     data: {
//       email,
//       password
//     }
//   })
//   console.log(response);
//   return c.text(`${email} logged in successfully !!! `)
// })
// app.post('/api/v1/user/signin', async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   const email = c.req.header('email');
//   const password = c.req.header('password');
//   if (!email || !password) {
//     return c.json({
//       msg: 'Email and password are necessary'
//     });
//   }
//   const response = await prisma.user.findFirst({
//     where: {
//       email
//     }
//   })
//   console.log(response);
//   const id = response?.id
//   const token = await sign({ email, id }, jwtPassword);
//   console.log(response);
//   return c.text(token)
// })
// app.post('/api/v1/blog', async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   const body = JSON.parse(await c.req.text());
//   const authorId = c.get('jwtPayload');
//   const { title, content, published } = body;
//   console.log([title, content, published]);
//   const response = await prisma.post.create({
//     data: {
//       title,
//       content,
//       published,
//       authorId
//     }
//   })
//   console.log(response);
//   return c.text('blog successfully created ');
// })
// app.put('/api/v1/blog', async (c) => {
//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
//   const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   const authorId = c.get('jwtPayload');
//   const body = await c.req.json();
//   const { id, title, content } = body;
//   console.log([title, content, id, authorId]);
//   await prisma.post.update({
//     where: {
//       id,
//       authorId
//     },
//     data: {
//       title,
//       content
//     }
//   })
//   return c.text('Succefully updated the blog')
// })

// app.get('/api/v1/blog/:id', async (c) => {
//   return c.text(`Successfully fetched all the blogs by id !!!`);
 

// })

// app.post('/api/v1/blog/bulk', async (c) => {
//   const token = c.req.header('token');
//   const authorId = c.get('jwtPayload');
//   if (!token) {
//     return c.json({
//       msg: 'Token needed',
//     });
//   }
//   const response = decode(token);
//   console.log('decoded token',response);

//   const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
// const email = response.payload.email ;
// console.log('email',email);

//    const prisma = new PrismaClient({
//     datasourceUrl: DATABASE_URL,
//   }).$extends(withAccelerate());
//   const id = c.req.param('id')
//   const blogs = await prisma.post.findMany({
//     where: {
//       authorId 
//     }
//   }); 
//   console.log('blogs',blogs);

//   return c.text('successfully fetched all the blogs');
// })

// export default app