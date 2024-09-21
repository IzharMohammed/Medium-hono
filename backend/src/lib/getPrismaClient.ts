import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { env } from 'hono/adapter';

export default function getPrismaClient(c: any) {
    // Get the database URL from environment variables
    const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);
    // Initialize Prisma Client with the Accelerate extension
    const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
    }).$extends(withAccelerate());
    console.log('inside');
    return prisma;
}