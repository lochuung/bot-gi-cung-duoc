import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from './common/command.abstract';
import { TourismService } from '@app/services/tourism.service';
import { ChannelMessage } from 'mezon-sdk';
import { DIDAUCUNGDUOC_MESSAGES } from '@app/messages/didaucungduoc.messages';
import { formatMessage } from '@app/utils/message-formatter.utils';

@Command('didaucungduoc', {
  description:
    'Gợi ý địa điểm du lịch ngẫu nhiên (có thể lọc theo miền hoặc tỉnh/thành phố trực thuộc TW)',
  usage:
    '!didaucungduoc [miền|tỉnh]\nVí dụ: !didaucungduoc miền bắc\n!didaucungduoc quảng ninh\n!didaucungduoc cần thơ',
  category: 'Tourism',
  aliases: ['di', 'tour', 'travel'],
})
export class DiDauCungDuocCommand extends CommandMessage {
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
      let errorMessage: string;
      
      if (filters.region || filters.province) {
        errorMessage = DIDAUCUNGDUOC_MESSAGES.ERROR.NO_PLACES_WITH_FILTERS;
        if (filters.region) {
          errorMessage += '\n' + formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_DISPLAY.REGION, {
            value: filters.region
          });
        }
        if (filters.province) {
          errorMessage += '\n' + formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_DISPLAY.PROVINCE, {
            value: filters.province
          });
        }
      } else {
        errorMessage = DIDAUCUNGDUOC_MESSAGES.ERROR.NO_PLACES_FOUND;
      }
      
      errorMessage += `\n\n${DIDAUCUNGDUOC_MESSAGES.INFO.TIPS.TRY_AGAIN}`;

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
    lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.PLACE_DETAILS.SUGGESTION, {
      address: result.picked.address
    }));
    lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.PLACE_DETAIL_ITEM, {
      label: DIDAUCUNGDUOC_MESSAGES.INFO.PLACE_DETAILS.PROVINCE,
      value: result.picked.province
    }));
    lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.PLACE_DETAIL_ITEM, {
      label: DIDAUCUNGDUOC_MESSAGES.INFO.PLACE_DETAILS.REGION,
      value: result.picked.region
    }));

    // Filter info
    if (filters.region || filters.province) {
      lines.push('');
      lines.push(DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_INFO);
      if (filters.region) {
        lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_ITEM, {
          label: DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_LABELS.REGION,
          value: filters.region
        }));
      }
      if (filters.province) {
        lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_ITEM, {
          label: DIDAUCUNGDUOC_MESSAGES.INFO.FILTER_LABELS.PROVINCE,
          value: filters.province
        }));
      }
    }

    // Statistics
    lines.push('');
    lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.STATISTICS, { total: result.total.toString() }));

    // Additional suggestions
    if (result.suggestions.length > 0) {
      lines.push('');
      lines.push(DIDAUCUNGDUOC_MESSAGES.INFO.OTHER_SUGGESTIONS);
      result.suggestions.forEach((place, index) => {
        lines.push(formatMessage(DIDAUCUNGDUOC_MESSAGES.INFO.SUGGESTION_ITEM, {
          index: (index + 1).toString(),
          address: place.address,
          province: place.province
        }));
      });
    }

    // Usage tip
    lines.push('');
    lines.push(DIDAUCUNGDUOC_MESSAGES.INFO.TIPS.USAGE);

    return this.replyMessageGenerate(
      {
        messageContent: lines.join('\n'),
        mk: true,
      },
      message,
    );
  }
}
