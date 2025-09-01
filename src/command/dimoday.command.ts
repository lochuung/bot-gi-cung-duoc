import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from './common/command.abstract';
import { TourismService } from '@app/services/tourism.service';
import { ChannelMessage } from 'mezon-sdk';

@Command('dimoday', {
  description:
    'Gợi ý địa điểm du lịch ngẫu nhiên (có thể lọc theo miền hoặc tỉnh/thành phố trực thuộc TW)',
  usage:
    '!dimoday [miền|tỉnh]\nVí dụ: !dimoday miền bắc\n!dimoday quảng ninh\n!dimoday cần thơ',
  category: 'Tourism',
  aliases: ['di', 'tour', 'travel'],
})
export class DimodayCommand extends CommandMessage {
  constructor(private readonly tourismService: TourismService) {
    super();
  }

  async execute(args: string[], message: ChannelMessage) {
    const filters = this.tourismService.parseFilters(args);
    const result = await this.tourismService.findRandomPlace(
      filters,
      message.username,
    );

    if (!result.picked) {
      let errorMessage = '😔 Không tìm thấy địa điểm nào';

      if (filters.region || filters.province) {
        errorMessage += ' với điều kiện:';
        if (filters.region) errorMessage += `\n🗺️ Miền: ${filters.region}`;
        if (filters.province)
          errorMessage += `\n🏞️ Tỉnh/Thành phố: ${filters.province}`;
      }

      errorMessage +=
        '\n\n💡 Thử lại với: `!dimoday` (ngẫu nhiên) hoặc `!dimoday miền bắc`';

      return this.replyMessageGenerate(
        {
          messageContent: errorMessage,
          mk: true,
        },
        message,
      );
    }

    const lines: string[] = [];

    lines.push(`🌍 **Gợi ý hôm nay: ${result.picked.address}**`);
    lines.push(`🏞️ Tỉnh/Thành phố: ${result.picked.province}`);
    lines.push(`🗺️ Miền: ${result.picked.region}`);

    if (filters.region || filters.province) {
      lines.push('');
      lines.push('🎯 **Tiêu chí tìm kiếm:**');
      if (filters.region) lines.push(`   • Miền: ${filters.region}`);
      if (filters.province)
        lines.push(`   • Tỉnh/Thành phố: ${filters.province}`);
    }

    lines.push('');
    lines.push(`📊 Tổng số địa điểm thỏa mãn: **${result.total}** nơi`);

    if (result.suggestions.length > 0) {
      lines.push('');
      lines.push('💡 **Gợi ý khác:**');
      result.suggestions.forEach((place, index) => {
        lines.push(`   ${index + 1}. ${place.address} (${place.province})`);
      });
    }

    lines.push('');
    lines.push(
      '💬 *Gõ `!dimoday` để random toàn quốc hoặc `!dimoday quảng ninh` để lọc theo tỉnh hoặc thành phố*',
    );

    return this.replyMessageGenerate(
      {
        messageContent: lines.join('\n'),
        mk: true,
      },
      message,
    );
  }
}
