import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { BotGateway } from '@app/gateway/bot.gateway';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    const bot = app.get(BotGateway);
    bot.initEvent();

    await app.listen(3000);
}
bootstrap();