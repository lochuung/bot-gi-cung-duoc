import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';
import { ANGI_MESSAGES } from '@app/messages/angi.messages';
import { formatMessage, joinMessages } from '@app/utils/message-formatter.utils';

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
                if (filters.region) {
                    errorMessage += '\n' + formatMessage(ANGI_MESSAGES.INFO.FILTER_DISPLAY.REGION, {
                        label: ANGI_MESSAGES.INFO.FILTER_LABELS.REGION,
                        value: filters.region
                    });
                }
                if (filters.category) {
                    errorMessage += '\n' + formatMessage(ANGI_MESSAGES.INFO.FILTER_DISPLAY.CATEGORY, {
                        label: ANGI_MESSAGES.INFO.FILTER_LABELS.CATEGORY,
                        value: filters.category
                    });
                }
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
        lines.push(formatMessage(ANGI_MESSAGES.INFO.DISH_DETAIL_ITEM, {
            label: ANGI_MESSAGES.INFO.DISH_DETAILS.NAME,
            value: `${result.picked.name}`
        }));
        lines.push(formatMessage(ANGI_MESSAGES.INFO.DISH_DETAIL_ITEM, {
            label: ANGI_MESSAGES.INFO.DISH_DETAILS.PROVINCE,
            value: result.picked.province
        }));
        lines.push(formatMessage(ANGI_MESSAGES.INFO.DISH_DETAIL_ITEM, {
            label: ANGI_MESSAGES.INFO.DISH_DETAILS.REGION,
            value: result.picked.region
        }));
        lines.push(formatMessage(ANGI_MESSAGES.INFO.DISH_DETAIL_ITEM, {
            label: ANGI_MESSAGES.INFO.DISH_DETAILS.CATEGORY,
            value: result.picked.category
        }));
        
        // Filter info
        if (filters.region || filters.category) {
            lines.push('');
            lines.push(ANGI_MESSAGES.INFO.FILTER_INFO);
            if (filters.region) {
                lines.push(formatMessage(ANGI_MESSAGES.INFO.FILTER_ITEM, {
                    label: ANGI_MESSAGES.INFO.FILTER_LABELS.REGION,
                    value: filters.region
                }));
            }
            if (filters.category) {
                lines.push(formatMessage(ANGI_MESSAGES.INFO.FILTER_ITEM, {
                    label: ANGI_MESSAGES.INFO.FILTER_LABELS.CATEGORY,
                    value: filters.category
                }));
            }
        }
        
        // Statistics
        lines.push('');
        lines.push(formatMessage(ANGI_MESSAGES.INFO.STATISTICS, { total: result.total.toString() }));

        // Additional suggestions
        if (result.suggestions.length > 0) {
            lines.push('');
            lines.push(ANGI_MESSAGES.INFO.OTHER_SUGGESTIONS);
            result.suggestions.forEach((dish, index) => {
                lines.push(formatMessage(ANGI_MESSAGES.INFO.SUGGESTION_ITEM, {
                    index: (index + 1).toString(),
                    name: dish.name,
                    province: dish.province
                }));
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
