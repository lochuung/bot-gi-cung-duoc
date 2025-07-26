import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';

@Command('about', {
    description: 'Information about the Mezon Eatery bot',
    usage: '!about',
    category: 'General',
    aliases: ['info'],
})
export class AboutCommand extends CommandMessage {
    execute(args: string[], message: ChannelMessage) {
        const messageContent = [
            '🤖 **Mezon Eatery Bot**',
            '',
            '**Version:** 1.0.0',
            '**Framework:** NestJS with TypeScript',
            '**Platform:** Mezon Chat',
            '',
            '**Features:**',
            '',
            '**Author:** Nguyen Huu Loc, Nguyen Hoang Duy, Pham Le Quoc Phi',
            '**Repository:** https://github.com/lochuung/MezonEatery',
        ].join('\n');

        return this.replyMessageGenerate({
            messageContent,
            mk: [{ type: 'pre', s: 0, e: messageContent.length }],
        }, message);
    }
}
