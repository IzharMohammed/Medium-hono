const jwtPassword = 'secret';
import { Hono } from 'hono';
import { sign } from 'hono/jwt'
import { z as zod } from 'zod';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter';

export const userRouter = new Hono();

userRouter.post('/api/v1/user/signup', async (c) => {

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

userRouter.post('/api/v1/user/signin', async (c) => {

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

    console.log(response);
    const id = response?.id
    const token = await sign({ email, id }, jwtPassword);

    console.log(response);

    return c.text(token)
})
