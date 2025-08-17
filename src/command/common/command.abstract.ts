import { ApiMessageRef, ChannelMessage } from 'mezon-sdk';
import { ReplyMezonMessage } from '@app/dtos/MezonReplyMessageDto';
import { replyMessageGenerate } from '@app/utils/message';
import { UserService } from '@app/services/user.service';

export abstract class CommandMessage {
    protected userService?: UserService;

    // Method to set UserService (will be called by the framework)
    setUserService(userService: UserService): void {
        this.userService = userService;
    }

    abstract execute(
        args: string[],
        message: ChannelMessage,
        commandName?: string,
    ): any;

    replyMessageGenerate(
        replayConent: { [x: string]: any },
        message: ChannelMessage,
        hasRef: boolean = true,
        newRef?: ApiMessageRef[],
    ): ReplyMezonMessage {
        return replyMessageGenerate(replayConent, message, hasRef, newRef);
    }
}