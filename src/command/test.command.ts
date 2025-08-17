import { ChannelMessage } from "mezon-sdk";
import { CommandMessage } from "./common/command.abstract";
import { Command } from "@app/decorators/command.decorator";
import { IsAdmin } from "@app/decorators/admin.decorator";

@Command('test', {
    description: 'Check bot latency and responsiveness',
    usage: '!test',
    category: 'Utility',
})
@IsAdmin()
export class TestCommand extends CommandMessage {
    execute(args: string[], message: ChannelMessage) {
        const messageContent = `Hello World!`;
        
        return this.replyMessageGenerate({ messageContent }, message);
    }
}
