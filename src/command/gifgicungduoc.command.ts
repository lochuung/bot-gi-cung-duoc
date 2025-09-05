import { CommandMessage } from '@app/command/common/command.abstract';
import { Command } from '@app/decorators/command.decorator';
import axios from 'axios';
import { ChannelMessage } from 'mezon-sdk';

@Command('gifgicungduoc', {
    description: 'Random gif',
    usage: '!gifgicungduoc',
    category: 'Entertainment',
    aliases: ['gif'],
})
export class GifGicungduocCommand extends CommandMessage {
    async execute(args: string[], message: ChannelMessage) {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY || ''}`);
        const gifData = response.data;
        return this.replyMessageGenerate({
            attachments: [
                {
                    url: gifData.data.images.original.url,
                    filetype: 'image/jpeg'
                }
            ]
        }, message);
    }
}
