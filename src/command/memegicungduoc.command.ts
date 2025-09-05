import { CommandMessage } from '@app/command/common/command.abstract';
import { Command } from '@app/decorators/command.decorator';
import axios from 'axios';
import { ChannelMessage } from 'mezon-sdk';

@Command('memegicungduoc', {
    description: 'Random meme',
    usage: '!memegicungduoc',
    category: 'Entertainment',
    aliases: ['meme'],
})
export class MemegicungduocCommand extends CommandMessage {
    async execute(args: string[], message: ChannelMessage) {
        const response = await axios.get('https://meme-api.com/gimme');
        const memeData = response.data;
        return this.replyMessageGenerate({
            attachments: [
                {
                    url: memeData.url,
                    filetype: 'image/jpeg'
                }
            ]
        }, message);
    }
}
