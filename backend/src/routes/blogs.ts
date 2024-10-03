import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { decode, verify } from 'hono/jwt'; // Importing JWT functions for token handling
import { updateBlogInput } from '../zod';
const { convert } = require('html-to-text')
import { encodeBase64 } from 'hono/utils/encode';
import getPrismaClient from '../lib/getPrismaClient';

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

async function getImageUrl(c: any) {
    // Retrieve environment variables using the Hono adapter
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env<{
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_UPLOAD_PRESET: string;
    }>(c);

    // Parse the request body to extract the image file
    const body = await c.req.parseBody();
    const image = body['image'] as File;
    if (!image) {
        throw new Error('Image file is missing.');
    }
    const byteArrayBuffer = await image.arrayBuffer();
    const base64 = encodeBase64(byteArrayBuffer);

    // Create a FormData object and append required fields
    const formData = new FormData();
    formData.append('file', `data:image/png;base64,${base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Add the upload preset

    // Send the POST request to Cloudinary using the FormData
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData // Use FormData instead of JSON.stringify
    });

    const data: any = await response.json();
    console.log('image', data.url);
    const imageUrl = data.url;
    return imageUrl;
}

// Route to create a new blog post
blogsRouter.post('/add', async (c) => {
    const imageUrl = await getImageUrl(c);

    const prisma = getPrismaClient(c);
    // Parse the request body to extract the form data only once
    const formData = await c.req.formData();
    // Extract other fields from the form data
    const title = formData.get('title') as string;
    const content = convert(formData.get('content') as string);
    const published = Boolean(formData.get('published'));
    const authorId = c.get('jwtPayload');
    const userProvidedDate = new Date();
    
    // Create a new blog post in the database
    const blogResponse = await prisma.post.create({
        data: {
            title,
            content,
            imageUrl,
            published,
            authorId,
            createdAt: userProvidedDate
        },
    });

    console.log('Blog response', blogResponse);

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

    // return c.text({'Fetched all the blogs',blogs});
    return c.json(blogs)
});

export default blogsRouter; // Export the router for use in other parts of the application
