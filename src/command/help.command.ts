import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { CommandStorage } from '@app/command/common/command.storage';

@Command('help')
export class HelpCommand extends CommandMessage {
    constructor() {
        super();
    }

    execute(args: string[], message: ChannelMessage) {
        const messageContent =
            `Available commands: !${Array.from(CommandStorage.getAllCommands().keys()).join(', !')}\n` +
            `Use !command_name for more information about a specific command.`;
        return this.replyMessageGenerate(
            {
                messageContent,
                mk: [{ type: 'pre', s: 0, e: messageContent.length }],
            },
            message,
        );
    }
}