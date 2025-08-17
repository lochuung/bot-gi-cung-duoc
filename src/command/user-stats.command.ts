import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';
import { Dish } from '@app/entities/dish.entity';

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
                `📊 **THỐNG KÊ CỦA ${message.username}**\n`,
                `🍽️ **Món đã gợi ý gần đây:** ${recentDishes.length}/10`,
            ];

            if (recentDishes.length > 0) {
                lines.push('\n🕒 **Món ăn gần đây:**');
                for (let i = 0; i < Math.min(5, recentDishes.length); i++) {
                    const dish = recentDishes[i];
                    if (dish) {
                        lines.push(`   ${i + 1}. ${dish.name} (${dish.province})`);
                    }
                }
                
                if (recentDishes.length > 5) {
                    lines.push(`   ... và ${recentDishes.length - 5} món khác`);
                }
                
                lines.push('\n💡 *Các món này sẽ không được gợi ý lại trong 24h*');
                lines.push('🧹 *Admin có thể xóa cache: `!dish clear-cache ' + message.username + '`*');
            } else {
                lines.push('\n✨ **Chưa có món nào được gợi ý!**');
                lines.push('💡 *Thử gõ `!angi` để được gợi ý món ăn*');
            }

            return this.replyMessageGenerate(
                {
                    messageContent: lines.join('\n'),
                    mk: true,
                },
                message,
            );
        } catch (error) {
            console.error('Error getting user stats:', error);
            return this.replyMessageGenerate(
                {
                    messageContent: '❌ **Lỗi khi lấy thống kê!** Vui lòng thử lại.',
                    mk: true,
                },
                message,
            );
        }
    }
}
