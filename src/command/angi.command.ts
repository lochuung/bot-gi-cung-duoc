import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';
import { ANGI_MESSAGES } from '@app/command/constants/angi.messages';
import { formatMessage, joinMessages } from '@app/command/utils/message-formatter.utils';

@Command('angi', {
    description: 'Gợi ý món ăn ngẫu nhiên (có thể lọc theo miền và phân loại)',
    usage: '!angi [miền] [phân loại]\nVí dụ: !angi miền nam món chính',
    category: 'Food',
    aliases: ['an', 'goimon', 'eat'],
})
export class AnGiCommand extends CommandMessage {
    constructor(private readonly dishService: DishService) {
        super();
    }

    async execute(args: string[], message: ChannelMessage) {
        const filters = this.dishService.parseFilters(args);
        const result = await this.dishService.findRandomDish(filters, message.username);

        if (!result.picked) {
            let errorMessage: string;
            
            if (filters.region || filters.category) {
                errorMessage = ANGI_MESSAGES.ERROR.NO_DISHES_WITH_FILTERS;
                if (filters.region) errorMessage += `\n🗺️ Miền: ${filters.region}`;
                if (filters.category) errorMessage += `\n🍽️ Phân loại: ${filters.category}`;
            } else {
                errorMessage = ANGI_MESSAGES.ERROR.NO_DISHES_FOUND;
            }
            
            errorMessage += `\n\n${ANGI_MESSAGES.INFO.TIPS.TRY_AGAIN}`;

            return this.replyMessageGenerate(
                {
                    messageContent: errorMessage,
                    mk: true,
                },
                message,
            );
        }

        const lines: string[] = [];
        
        // Main suggestion
        lines.push(`${ANGI_MESSAGES.INFO.DISH_DETAILS.NAME} ${result.picked.name}**`);
        lines.push(`${ANGI_MESSAGES.INFO.DISH_DETAILS.PROVINCE} ${result.picked.province}`);
        lines.push(`${ANGI_MESSAGES.INFO.DISH_DETAILS.REGION} ${result.picked.region}`);
        lines.push(`${ANGI_MESSAGES.INFO.DISH_DETAILS.CATEGORY} ${result.picked.category}`);
        
        // Filter info
        if (filters.region || filters.category) {
            lines.push('');
            lines.push(ANGI_MESSAGES.INFO.FILTER_INFO);
            if (filters.region) lines.push(`   • Miền: ${filters.region}`);
            if (filters.category) lines.push(`   • Phân loại: ${filters.category}`);
        }
        
        // Statistics
        lines.push('');
        lines.push(formatMessage(ANGI_MESSAGES.INFO.STATISTICS, { total: result.total.toString() }));

        // Additional suggestions
        if (result.suggestions.length > 0) {
            lines.push('');
            lines.push(ANGI_MESSAGES.INFO.OTHER_SUGGESTIONS);
            result.suggestions.forEach((dish, index) => {
                lines.push(`   ${index + 1}. ${dish.name} (${dish.province})`);
            });
        }

        // Usage tip
        lines.push('');
        lines.push(ANGI_MESSAGES.INFO.TIPS.USAGE);

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }
}
