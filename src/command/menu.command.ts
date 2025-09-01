import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';
import { MENU_MESSAGES } from '@app/command/constants/menu.messages';
import { formatMessage } from '@app/command/utils/message-formatter.utils';

@Command('menu', {
    description: 'Hiển thị thông tin về các món ăn có sẵn',
    usage: '!menu',
    category: 'Food',
    aliases: ['thucdon', 'list'],
})
export class MenuCommand extends CommandMessage {
    constructor(private readonly dishService: DishService) {
        super();
    }

    async execute(args: string[], message: ChannelMessage) {
        const regions = await this.dishService.getAvailableRegions();
        const categories = await this.dishService.getAvailableCategories();

        const lines: string[] = [];
        
        lines.push(MENU_MESSAGES.SUCCESS.HEADER);
        lines.push('');
        
        lines.push(MENU_MESSAGES.SUCCESS.REGIONS_HEADER);
        regions.forEach(region => {
            lines.push(formatMessage(MENU_MESSAGES.INFO.BULLET_POINT, { item: region }));
        });
        
        lines.push('');
        lines.push(MENU_MESSAGES.SUCCESS.CATEGORIES_HEADER);
        categories.forEach(category => {
            lines.push(formatMessage(MENU_MESSAGES.INFO.BULLET_POINT, { item: category }));
        });
        
        lines.push('');
        lines.push(MENU_MESSAGES.SUCCESS.USAGE_HEADER);
        lines.push(MENU_MESSAGES.INFO.USAGE_INSTRUCTIONS.RANDOM);
        lines.push(MENU_MESSAGES.INFO.USAGE_INSTRUCTIONS.BY_REGION);
        lines.push(MENU_MESSAGES.INFO.USAGE_INSTRUCTIONS.BY_CATEGORY);
        lines.push(MENU_MESSAGES.INFO.USAGE_INSTRUCTIONS.BY_BOTH);
        
        lines.push('');
        lines.push(MENU_MESSAGES.SUCCESS.ALIASES_HEADER);

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }
}
