import logger from "../logger/winston.logger";
import { ApiError } from "../utils/ApiError";

/**
 *
 * @param {Error | ApiError} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link asyncHandler}
 */

const errorHandler = (err, req, res, next) => {
    let error = err;
    // Check if the error is an instance of an ApiError class which extends native Error class
    if (!(error instanceof ApiError)) {
        // if not
        // create a new ApiError instance to keep the consistency

        // assign an appropriate status code
        const statusCode = err.statusCode;
        // set a message from native Error instance or a custom one
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Now we are sure that the `error` variable will be an instance of ApiError class
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    }
    logger.error(`${error.message}`)
    // Send error response
    return res.status(200).json(response);
}

export { errorHandler };