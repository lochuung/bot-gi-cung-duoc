import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';

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
        const result = await this.dishService.findRandomDish(filters);

        if (!result.picked) {
            let errorMessage = '😔 Không tìm thấy món ăn nào';
            
            if (filters.region || filters.category) {
                errorMessage += ' với điều kiện:';
                if (filters.region) errorMessage += `\n🗺️ Miền: ${filters.region}`;
                if (filters.category) errorMessage += `\n🍽️ Phân loại: ${filters.category}`;
            }
            
            errorMessage += '\n\n💡 Thử lại với: `!angi` (ngẫu nhiên) hoặc `!angi miền nam`';

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
        lines.push(`🍽️ **Gợi ý hôm nay: ${result.picked.name}**`);
        lines.push(`🏙️ Tỉnh/Thành: ${result.picked.province}`);
        lines.push(`🗺️ Miền: ${result.picked.region}`);
        lines.push(`📋 Phân loại: ${result.picked.category}`);
        
        // Filter info
        if (filters.region || filters.category) {
            lines.push('');
            lines.push('🎯 **Tiêu chí tìm kiếm:**');
            if (filters.region) lines.push(`   • Miền: ${filters.region}`);
            if (filters.category) lines.push(`   • Phân loại: ${filters.category}`);
        }
        
        // Statistics
        lines.push('');
        lines.push(`📊 Tổng số món thỏa mãn: **${result.total}** món`);

        // Additional suggestions
        if (result.suggestions.length > 0) {
            lines.push('');
            lines.push('💡 **Gợi ý khác:**');
            result.suggestions.forEach((dish, index) => {
                lines.push(`   ${index + 1}. ${dish.name} (${dish.province})`);
            });
        }

        // Usage tip
        lines.push('');
        lines.push('💬 *Gõ `!angi` để random toàn bộ hoặc `!angi miền bắc` để lọc theo miền*');

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }
}
