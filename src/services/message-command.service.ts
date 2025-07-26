import { Injectable, Logger } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';
import { AsyncThrottleQueue } from 'mezon-sdk/dist/cjs/mezon-client/utils/AsyncThrottleQueue';
import { MessageQueue } from './message-queue.service';
import { MezonClientService } from './mezon-client.service';

@Injectable()
export class MessageCommand {
    private readonly logger = new Logger(MessageCommand.name);
    private readonly client: MezonClient;
    private readonly throttleQueue = new AsyncThrottleQueue(45);

    constructor(
        private readonly messageQueue: MessageQueue,
        private readonly clientService: MezonClientService,
    ) {
        this.client = this.clientService.getClient();
        this.startMessageProcessing();
    }

    private startMessageProcessing(): void {
        setInterval(() => this.processMessages(), 50);
    }

    private processMessages(): void {
        while (this.messageQueue.hasMessages() && this.throttleQueue) {
            const message = this.messageQueue.getNextMessage();
            if (!message) break;

            this.throttleQueue.enqueue(() => this.handleMessage(message));
        }
    }

    private async handleMessage(message: any): Promise<void> {
        try {
            if (message.userId) {
                await this.sendDirectMessage(message);
            } else {
                await this.clientService.sendMessage(message);
            }
        } catch (error) {
            this.logger.error('Error handling message:', error);
        }
    }

    private async sendDirectMessage(message: any): Promise<void> {
        try {
            const dmClan = await this.client.clans.fetch('0');
            const user = await dmClan.users.fetch(message.userId);

            if (!user) return;

            await user.sendDM(
                {
                    t: message?.textContent ?? '',
                    ...(message?.messOptions ?? {}),
                },
                message?.code,
            );
        } catch (error) {
            this.logger.error('Error sending direct message:', error);
        }
    }
}