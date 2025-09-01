import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';
import { Dish } from '@app/entities/dish.entity';
import { USER_STATS_MESSAGES } from '@app/messages/user-stats.messages';
import { formatMessage } from '@app/utils/message-formatter.utils';

@Command('mystats', {
    description: 'Xem thống kê cá nhân về việc gợi ý món ăn',
    usage: '!mystats',
    category: 'General',
    aliases: ['stats', 'thongke'],
})
export class UserStatsCommand extends CommandMessage {
    constructor(private readonly dishService: DishService) {
        super();
    }

    async execute(args: string[], message: ChannelMessage) {
        try {
            // Check if user has any recent dishes
            const recentDishes: Dish[] = await this.dishService.getRecentDishesForUser(message.username);
            
            const lines = [
                formatMessage(USER_STATS_MESSAGES.SUCCESS.HEADER, { username: message.username }),
                '',
                formatMessage(USER_STATS_MESSAGES.SUCCESS.RECENT_DISHES_COUNT, { count: recentDishes.length.toString() }),
            ];

            if (recentDishes.length > 0) {
                lines.push('');
                lines.push(USER_STATS_MESSAGES.SUCCESS.RECENT_DISHES_HEADER);
                for (let i = 0; i < Math.min(5, recentDishes.length); i++) {
                    const dish = recentDishes[i];
                    if (dish) {
                        lines.push(formatMessage(USER_STATS_MESSAGES.SUCCESS.DISH_ITEM, {
                            index: (i + 1).toString(),
                            name: dish.name,
                            province: dish.province
                        }));
                    }
                }
                
                if (recentDishes.length > 5) {
                    lines.push(formatMessage(USER_STATS_MESSAGES.SUCCESS.MORE_DISHES, {
                        count: (recentDishes.length - 5).toString()
                    }));
                }
                
                lines.push('');
                lines.push(USER_STATS_MESSAGES.INFO.NO_CACHE_INFO);
                lines.push(formatMessage(USER_STATS_MESSAGES.INFO.ADMIN_CLEAR_CACHE, { username: message.username }));
            } else {
                lines.push('');
                lines.push(USER_STATS_MESSAGES.INFO.NO_DISHES_YET);
                lines.push(USER_STATS_MESSAGES.INFO.TRY_ANGI_TIP);
            }

            return this.replyMessageGenerate(
                {
                    messageContent: lines.join('\n'),
                    mk: true,
                },
                message,
            );
        } catch (error) {
            console.error(USER_STATS_MESSAGES.LOG.ERROR_GETTING_USER_STATS, error);
            return this.replyMessageGenerate(
                {
                    messageContent: USER_STATS_MESSAGES.ERROR.STATS_ERROR,
                    mk: true,
                },
                message,
            );
        }
    }
}
