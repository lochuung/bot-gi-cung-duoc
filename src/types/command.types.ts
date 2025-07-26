import { ChannelMessage } from 'mezon-sdk';
import { ReplyMezonMessage } from '@app/dtos/MezonReplyMessageDto';

export interface CommandInterface {
    execute: (
        messageContent: string,
        message: ChannelMessage,
        commandName?: string,
    ) => ReplyMezonMessage | null | ReplyMezonMessage[];
}