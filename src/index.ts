import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import bodyParser from 'body-parser';

import { serverConfig, logger } from './config';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

const client = new PrismaClient();

app.post('/hooks/catch/:userId/:taskId', async (req: Request, res: Response) => {
    try {
        const { userId, taskId } = req.params;
        const body = req.body;

        await client.$transaction(async (tx) => {
            const run = await tx.taskRun.create({
                data: {
                    taskId: taskId,
                    metadata: body
                }
            });;

            await tx.taskRunOutbox.create({
                data: {
                    taskRunId: run.id
                }
            });
        });

        res
            .status(StatusCodes.CREATED)
            .json({
                message: "webhook recieved"
            });

        logger.info(`Webhook Received of taskId: ${taskId}`);
    } catch (error: any) {
        logger.error(`Error in running web hook: ${error}`);
    }
});

app.listen(serverConfig.PORT, () => {
    logger.info(`Server Started on PORT: ${serverConfig.PORT}`);
});