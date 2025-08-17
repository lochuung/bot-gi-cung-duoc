import { dataSourceOption } from '@app/config/data-source.config';
import config, { envFilePath } from '@app/config/env.config';
import { redisConfig } from '@app/config/redis.config';
import * as Joi from '@hapi/joi';
import { BotModule } from '@app/modules/bot.module';
import { MezonModule } from '@app/modules/mezon.module';
import { HealthController } from '@app/controllers/health.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [config],
            validationSchema: Joi.object({
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_PORT: Joi.number().required(),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().required(),
                MEZON_TOKEN: Joi.string().required(),
                REDIS_HOST: Joi.string().default('localhost'),
                REDIS_PORT: Joi.number().default(6379),
                REDIS_PASSWORD: Joi.string().optional().allow(''),
            }),
            isGlobal: true,
            envFilePath: envFilePath,
        }),
        TypeOrmModule.forRoot(dataSourceOption),
        CacheModule.registerAsync(redisConfig),
        EventEmitterModule.forRoot(),
        MezonModule.forRootAsync({
            imports: [ConfigModule],
        }),
        BotModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }