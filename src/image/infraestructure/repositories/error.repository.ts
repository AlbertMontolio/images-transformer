import { ProcessName } from "../../utils/constants";
import { prisma } from "../prisma/prisma-client";

export class ErrorRepository {
    constructor() {}

    async create(data: {
        message: string;
        stack?: string;
        imageId: number;
        processName: ProcessName;
    }) {
        const process = await prisma.process.findUnique({
            where: {
                name: data.processName
            }
        });

        if (!process) {
            throw new Error('Process not found');
        }

        return await prisma.error.create({
            data: {
                message: data.message,
                stack: data.stack,
                image: {
                    connect: {
                        id: data.imageId
                    }
                },
                process: {
                    connect: {
                        id: process.id,
                    }
                }
            }
        });
    }
}
