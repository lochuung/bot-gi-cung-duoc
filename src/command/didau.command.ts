import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { TourismService } from '@app/services/tourism.service';

@Command('didau', {
  description: 'Hiển thị thông tin về các địa điểm du lịch có sẵn',
  usage: '!didau',
  category: 'Tourism',
  aliases: ['tourmenu', 'placemenu', 'travelmenu'],
})
export class DidauCommand extends CommandMessage {
  constructor(private readonly didauService: TourismService) {
    super();
  }

  async execute(args: string[], message: ChannelMessage, commandName?: string) {
    const regions = await this.didauService.getAvailableRegions();
    const provinces = await this.didauService.getAvailableProvinces();

    const lines: string[] = [];

    lines.push('🧳 **CÁC ĐỊA ĐIỂM DU LỊCH CÓ SẴN**');
    lines.push('');

    lines.push('🗺️ **Miền:**');
    regions.forEach((region) => {
      lines.push(`   • ${region}`);
    });

    lines.push('');
    lines.push('💡 **Cách sử dụng:**');
    lines.push('   • `!didauday` - Gợi ý ngẫu nhiên');
    lines.push('   • `!didauday miền nam` - Lọc theo miền');
    lines.push('   • `!didauday hà nội` - Lọc theo tỉnh/thành');
    lines.push('   • `!didauday miền bắc hà nội` - Lọc kết hợp');

    lines.push('');
    lines.push('🎯 **Aliases:** `!di`, `!dulich`, `!choi`');

    return this.replyMessageGenerate(
      {
        messageContent: lines.join('\n'),
        mk: true,
      },
      message,
    );
  }
}
