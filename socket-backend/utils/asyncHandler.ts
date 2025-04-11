import { NextFunction, Request, RequestHandler, Response } from "express";

/*
Key Features:
Eliminates need for try/catch blocks in async route handlers
Properly typed with Express's RequestHandler type
Automatically forwards errors to Express's error handling middleware
Preserves TypeScript type checking for route handlersF
*/

/**
 * Wraps async route handlers to automatically catch promise rejections
 * @param requestHandler Async express request handler
 * @returns Promise-handling middleware
 */

const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}

export { asyncHandler };