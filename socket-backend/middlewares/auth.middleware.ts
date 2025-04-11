import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { HttpStatusCode } from "../types";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyJwt = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        const user = await prisma.user.findUnique({ where: { id: Number(decodedToken) } });
        if (!user) {
            // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
            // Then they will get a new access token which will allow them to refresh the access token without logging out the user
            throw new ApiError(HttpStatusCode.UNAUTHORIZED, "Invalid access token");
        }
        //@ts-ignore
        req.user = user;
        next();
    } catch (error) {
        // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
        // Then they will get a new access token which will allow them to refresh the access token without logging out the user
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, error?.message || "Invalid access token");

    }
});