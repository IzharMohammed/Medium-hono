import { expect, jest, it, describe } from '@jest/globals';

jest.mock("../../lib/prisma", () => ({
    chat: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    chatMessage: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    }
}));

jest.mock("../../socket", () => ({
    emitSocketEvent: jest.fn(),
}))


