import z from 'zod';

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
})

export type createBlogInput = z.infer<typeof createBlogInput>;

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string()
})

export type updateBlogInput = z.infer<typeof updateBlogInput>;
