import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { DishService } from '@app/services/dish.service';

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
        
        lines.push('🍽️ **MENU CÁC MÓN ĂN CÓ SẴN**');
        lines.push('');
        
        lines.push('🗺️ **Miền:**');
        regions.forEach(region => {
            lines.push(`   • ${region}`);
        });
        
        lines.push('');
        lines.push('📋 **Phân loại:**');
        categories.forEach(category => {
            lines.push(`   • ${category}`);
        });
        
        lines.push('');
        lines.push('💡 **Cách sử dụng:**');
        lines.push('   • `!angi` - Gợi ý ngẫu nhiên');
        lines.push('   • `!angi miền nam` - Lọc theo miền');
        lines.push('   • `!angi món chính` - Lọc theo phân loại');
        lines.push('   • `!angi miền nam món chính` - Lọc cả hai');
        
        lines.push('');
        lines.push('🎯 **Aliases:** `!an`, `!goimon`, `!eat`');

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }
}
