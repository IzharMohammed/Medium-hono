import { HttpStatusCode } from "../types";

/**
 * Custom error class for consistent error handling across the application
 */
class ApiError extends Error {
    public statusCode:  number;
    public success: boolean;
    public data: null;
    public errors: any;

    constructor(
        statusCode: number,
        message: string = "Something went wrong...",
        errors: any[] = [],
        stack: string = "",
    ) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

    }
};

export { ApiError };