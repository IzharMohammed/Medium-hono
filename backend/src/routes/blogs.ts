import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { env } from 'hono/adapter';
import { decode, verify } from 'hono/jwt'; // Importing JWT functions for token handling
import { createBlogInput, updateBlogInput } from '../zod';
import cloudinaryUpload from '../utils/cloudinary';
import { encodeBase64 } from 'hono/utils/encode';
//import { v2 as cloudinary } from 'cloudinary';
//import getDataUri from '../utils/dataUri';
//import cloudinaryUpload from '../utils/cloudinary';
const jwtPassword = 'secret'; // Secret key used for JWT signing and verification

type responsePayload = {
    email: string,
    id: number
}

const blogsRouter = new Hono(); // Create a new Hono router instance

// Middleware to verify the JWT token for all routes under this router
blogsRouter.use('/*', async (c, next) => {
    const token = c.req.header('token'); // Get the token from the request headers

    if (!token) {
        return c.json({
            msg: 'Token needed',
        }); // Respond with an error if the token is missing
    }

    try {
        // Verify the token and cast it to the responsePayload type
        const response = await verify(token, jwtPassword) as responsePayload;
        const id = response.id; // Extract the user ID from the verified token

        console.log(response);
        // Store the user ID in the context for later use
        c.set('jwtPayload', id);
        await next(); // Continue to the next middleware or route handler
    } catch (error) {
        return c.json({
            msg: 'Invalid token',
        }, 401); // Respond with an error if the token is invalid
    }
});

// blogsRouter.use(async (c, next) => {
//     // Configuration
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });
//     await next();
// })

function getPrismaClient(c: any) {
    // Get the database URL from environment variables
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    // Initialize Prisma Client with the Accelerate extension
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());
    console.log('inside');
    return prisma;
}


// Route to create a new blog post
blogsRouter.post('/add', async (c) => {

    const prisma = getPrismaClient(c);

    // Parse the request body as JSON
    //const body = JSON.parse(await c.req.text());

    // Get the author ID from the context (set by the middleware)
    const authorId = c.get('jwtPayload');

    //zod validation
    //const { success } = createBlogInput.safeParse(body);

    //const { title, content, published } = body;

    const formData = await c.req.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const published = Boolean(formData.get('published'));
    const file = formData.get('file')
/*     c.req.parseBody().then(async (body) => {
        const image = body['image'] as File;
        const byteArrayBuffer = await image.arrayBuffer();
        const base64 = encodeBase64(byteArrayBuffer);
        const results = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`);
        console.log('results', results);
        return c.json({ results });

    }) */

    //const fileUri = getDataUri(file);
    //cloudinaryUpload(fileUri.content)


    console.log([title, content, published, file]);


    const userProvidedDate = new Date();
    //  cloudinaryUpload(file)

    if (true) {
        // Create a new blog post in the database
        const response = await prisma.post.create({
            data: {
                title,
                content,
                published,
                authorId,
                createdAt: userProvidedDate
            },
        });
        console.log('response', response);
    }

    return c.text('Blog successfully created');
});


// Route to update an existing blog post
blogsRouter.put('/', async (c) => {

    const prisma = getPrismaClient(c);

    const authorId = c.get('jwtPayload'); // Get the author ID from the context

    // Parse the request body as JSON
    const body = await c.req.json();

    const { success } = updateBlogInput.safeParse(body);

    const { id, title, content } = body;
    console.log([title, content, id, authorId]);

    if (success) {
        // Update the blog post with the given ID and author ID
        await prisma.post.update({
            where: {
                id,
                authorId,
            },
            data: {
                title,
                content,
            },
        });

    }
    return c.text('Successfully updated the blog');
});


// Route to fetch a blog post by ID (Note: This implementation just returns a placeholder text)
blogsRouter.get('/:id', async (c) => {

    const prisma = getPrismaClient(c);

    try {
        const response = await prisma.post.findFirst({ where: { id: parseInt(c.req.param('id')) } });
        return c.json(response); // Ensure you return the response
    } catch (error) {
        return c.json({ msg: 'Error fetching blog' }, 500); // Handle errors
    }

});


// Route to fetch all blog posts in bulk
blogsRouter.post('/bulk', async (c) => {

    const token = c.req.header('token'); // Get the token from the request headers

    const authorId = c.get('jwtPayload'); // Get the author ID from the context

    if (!token) {
        return c.json({
            msg: 'Token needed',
        });
    }

    const response = decode(token); // Decode the token without verifying it
    console.log('decoded token', response);

    const email = response.payload.email; // Extract the email from the decoded token
    console.log('email', email);

    const prisma = getPrismaClient(c);

    const blogs = await prisma.post.findMany({
        where: {
            authorId,
        },
    });

    console.log('blogs', blogs);

    return c.text('successfully fetched all the blogs');
});

export default blogsRouter; // Export the router for use in other parts of the application
