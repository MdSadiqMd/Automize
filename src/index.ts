import express from 'express';

import { serverConfig, logger } from './config';

const app = express();

app.listen(serverConfig.PORT, () => {
    logger.info(`Server Started on PORT: ${serverConfig.PORT}`);
});