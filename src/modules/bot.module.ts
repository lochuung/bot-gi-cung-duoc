import { HelpCommand } from '@app/command/help.command';
import { PingCommand } from '@app/command/ping.command';
import { AboutCommand } from '@app/command/about.command';
import { AnGiCommand } from '@app/command/angi.command';
import { MenuCommand } from '@app/command/menu.command';
import { ClientConfigService } from '@app/config/client.config';
import { BotGateway } from '@app/gateway/bot.gateway';
import { EventListenerChannelMessage } from '@app/listeners';
import { CommandService } from '@app/services/command.service';
import { MessageCommand } from '@app/services/message-command.service';
import { MessageQueue } from '@app/services/message-queue.service';
import { DishService } from '@app/services/dish.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishEntity } from '@app/entities/dish.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([DishEntity]),
    ],
    providers: [
        BotGateway,
        ClientConfigService,
        ConfigService,
        CommandService,
        MessageQueue,
        MessageCommand,
        DishService,

        // Listeners
        EventListenerChannelMessage,

        // Commands
        HelpCommand,
        PingCommand,
        AboutCommand,
        AnGiCommand,
        MenuCommand,
    ],
    controllers: [],
})
export class BotModule { }