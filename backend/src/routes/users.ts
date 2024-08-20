// Define the JWT password used for signing tokens
const jwtPassword = 'secret';

import { Hono } from 'hono';
import { sign } from 'hono/jwt'; // Import the `sign` function from the Hono JWT module for token creation
import { z as zod } from 'zod'; // Import the Zod library for schema validation
import { PrismaClient } from '@prisma/client/edge'; // Import Prisma Client for database interactions
import { withAccelerate } from '@prisma/extension-accelerate'; // Import Prisma's Accelerate extension for optimization
import { env } from 'hono/adapter'; // Import Hono's environment adapter

// Create a new Hono router instance for user-related routes
export const userRouter = new Hono();

// Route to handle user signup
userRouter.post('signup', async (c) => {

    // Get the database URL from environment variables using the Hono adapter
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    // Initialize Prisma Client with the Accelerate extension using the database URL
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());

    // Get the email and password from the request headers
    const body = JSON.parse(await c.req.text());
    const {email , password} = body;

    // Define validation schemas for email and password using Zod
    const emailSchema = zod.string().email();
    const passwordSchema = zod.string().min(4);

    // Check if email and password are provided
    if (!email || !password) {
        return c.json({
            msg: 'Email and password are necessary'
        });
    }

    // Validate the email and password using the schemas
    const emailResponse = emailSchema.safeParse(email);
    const passwordResponse = passwordSchema.safeParse(password);

    // Return an error if the email is invalid
    if (!emailResponse.success) {
        return c.json({
            msg: 'Invalid email'
        });
    }

    // Return an error if the password is less than 4 characters
    if (!passwordResponse.success) {
        return c.json({
            msg: 'Password must be minimum 4 characters'
        });
    }

    // Create a new user in the database with the provided email and password
    const response = await prisma.user.create({
        data: {
            email,
            password
        }
    });
    console.log(response); // Log the response from the database

    // Return a success message indicating that the user has successfully signed up
    return c.text(`${email} logged in successfully !!! `);
});

// Route to handle user signin
userRouter.post('signin', async (c) => {
    
    // Get the database URL from environment variables using the Hono adapter
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    // Initialize Prisma Client with the Accelerate extension using the database URL
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());

    // Get the email and password from the request headers
    // const email = c.req.header('email');
    // const password = c.req.header('password');

    const body = JSON.parse(await c.req.text());
    const {email , password} = body;

    // Check if email and password are provided
    if (!email || !password) {
        return c.json({
            msg: 'Email and password are necessary'
        });
    }

    // Find the user in the database with the provided email
    const response = await prisma.user.findFirst({
        where: {
            email
        }
    });

    console.log(response); // Log the response from the database

    // Get the user ID from the response (if found)
    const id = response?.id;
    // Create a JWT token with the user's email and ID
    const token = await sign({ email, id }, jwtPassword);

    console.log(response); // Log the response again for verification

    // Return the generated JWT token
    return c.text(token);
});
