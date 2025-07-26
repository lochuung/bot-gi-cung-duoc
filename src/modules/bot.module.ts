import { HelpCommand } from '@app/command/help.command';
import { ClientConfigService } from '@app/config/client.config';
import { BotGateway } from '@app/gateway/bot.gateway';
import { EventListenerChannelMessage } from '@app/listeners';
import { CommandService } from '@app/services/command.service';
import { MessageCommand } from '@app/services/message-command.service';
import { MessageQueue } from '@app/services/message-queue.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // TypeOrmModule.forFeature([]),
    ],
    providers: [
        BotGateway,
        ClientConfigService,
        ConfigService,
        CommandService,
        MessageQueue,
        MessageCommand,

        // Listeners
        EventListenerChannelMessage,

        // Commands,
        HelpCommand,
    ],
    controllers: [],
})
export class BotModule { }