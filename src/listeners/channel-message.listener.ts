import { ClientConfigService } from '@app/config/client.config';
import { ReplyMezonMessage } from '@app/dtos/MezonReplyMessageDto';
import { CommandService } from '@app/services/command.service';
import { MessageQueue } from '@app/services/message-queue.service';
import { MezonClientService } from '@app/services/mezon-client.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
    ChannelMessage,
    Events,
    MezonClient
} from 'mezon-sdk';

@Injectable()
export class EventListenerChannelMessage {
    private client: MezonClient;
    private readonly logger = new Logger(EventListenerChannelMessage.name);
    constructor(
        private clientService: MezonClientService,
        private clientConfigService: ClientConfigService,
        private commandService: CommandService,
        private messageQueue: MessageQueue,
    ) {
        this.client = clientService.getClient();
    }

    @OnEvent(Events.ChannelMessage)
    async handleCommand(msg: ChannelMessage) {
        if (msg.code) return; // Do not support case edit message
        try {
            const content = msg.content.t;
            let replyMessage: ReplyMezonMessage;
            if (typeof content == 'string' && content.trim()) {
                const prefixTrim = content.trim()[0];
                switch (prefixTrim) {
                    case this.clientConfigService.prefix:
                        replyMessage = await this.commandService.execute(content, msg);
                        break;
                    default:
                        return;
                }

                if (replyMessage) {
                    const replyMessageArray = Array.isArray(replyMessage)
                        ? replyMessage
                        : [replyMessage];
                    for (const mess of replyMessageArray) {
                        this.messageQueue.addMessage({
                            ...mess,
                            sender_id: msg.sender_id,
                            message_id: msg.message_id,
                        });
                    }
                }
            }
        } catch (e) {
            this.logger.error('Error processing channel message:', e);
        }
    }
}