import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter'
const jwtPassword = 'secret';
import { decode, sign, verify } from 'hono/jwt'
const app = new Hono()
import { z as zod } from 'zod';

type responsePayload = {
  email: string
}

app.use('/api/v1/blog/*', async (c, next) => {
  const token = c.req.header('token');

  if (!token) {
    return c.json({
      msg: 'Token needed',
    });
  }

  try {
    const response = await verify(token, jwtPassword) as responsePayload;
    const email = response.email;

    console.log(response);
    // c.header('response', email);
    c.set('jwtPayload', email)
    await next();
  } catch (error) {
    return c.json({
      msg: 'Invalid token',
    }, 401);
  }
});



app.post('/api/v1/user/signup', async (c) => {

  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  const email = c.req.header('email');
  const password = c.req.header('password');

  const emailSchema = zod.string().email();
  const passwordSchema = zod.string().min(4);

  if (!email || !password) {
    return c.json({
      msg: 'Email and password are necessary'
    });
  }

  const emailResponse = emailSchema.safeParse(email);
  const passwordResponse = passwordSchema.safeParse(password);

  if (!emailResponse.success) {
    return c.json({
      msg: 'Invalid email'
    })
  }

  if (!passwordResponse.success) {
    return c.json({
      msg: 'Password must be minimum 4 characters'
    })
  }

  const response = await prisma.user.create({
    data: {
      email,
      password
    }
  })
  console.log(response);

  return c.text(`${email} logged in successfully !!! `)
})

app.post('/api/v1/user/signin', async (c) => {

  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  const email = c.req.header('email');
  const password = c.req.header('password');

  if (!email || !password) {
    return c.json({
      msg: 'Email and password are necessary'
    });
  }

  const response = await prisma.user.findFirst({
    where: {
      email
    }
  })

  const token = await sign({ email }, jwtPassword);

  console.log(response);

  return c.text(token)
})

app.post('/api/v1/blog', (c) => {
  console.log('response', c.get('jwtPayload'));

  return c.text('i am in 2 !!!')
})


app.put('/api/v1/blog', (c) => {
  return c.text('i am in 3 !!!')
})

app.get('/api/v1/blog/:id', (c) => {
  const id = c.req.param('id')

  return c.text(`id is :- ${id}`)
})

app.post('/api/v1/blog/bulk', (c) => {
  return c.text('i am in 4 !!!')
})

export default app
