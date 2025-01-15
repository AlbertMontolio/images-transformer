import { ProcessName } from "../../utils/constants";
import { prisma } from "../prisma/prisma-client";

export class ErrorRepository {
    constructor() {}

    async findAllByProcess(processName: ProcessName) {
        // TODO: projectId should be also given as a parameter
        return await prisma.error.findMany({
            where: {
                process: {
                    name: processName
                }
            }
        });
    }

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
