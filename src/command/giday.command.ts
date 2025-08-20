import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { GiDayService, GiDayRandomResult } from '@app/services/giday.service';

@Command('giday', {
    description: 'Tạo danh sách lựa chọn và random một trong số đó',
    usage: `!giday <option1>, <option2>, <option3> - Random trực tiếp
!giday add <option> - Thêm lựa chọn vào danh sách
!giday done - Random từ danh sách đã tạo
!giday list - Xem danh sách hiện tại
!giday clear - Xóa hết danh sách`,
    category: 'Utility',
    aliases: ['gd', 'random', 'choice'],
})
export class GiDayCommand extends CommandMessage {
    constructor(private readonly giDayService: GiDayService) {
        super();
    }

    async execute(args: string[], message: ChannelMessage) {
        const userId = message.sender_id;

        if (args.length === 0) {
            return this.showHelp(message);
        }

        const fullArgsString = args.join(' ');

        // Check if user is providing comma-separated options (direct mode)
        if (fullArgsString.includes(',')) {
            return await this.handleDirectMode(fullArgsString, message);
        }

        // Handle subcommands
        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'add':
                return await this.handleAddOption(args.slice(1), userId, message);
            case 'done':
                return await this.handleDone(userId, message);
            case 'list':
                return await this.handleList(userId, message);
            case 'clear':
                return await this.handleClear(userId, message);
            case 'help':
                return this.showHelp(message);
            default:
                // Treat as adding option (backward compatibility)
                return await this.handleAddOption(args, userId, message);
        }
    }

    private async handleDirectMode(optionsString: string, message: ChannelMessage) {
        const result = await this.giDayService.handleDirectMode(optionsString);
        
        if (!result.success) {
            return this.replyMessageGenerate(
                {
                    messageContent: result.error!,
                    mk: true,
                },
                message,
            );
        }

        return this.formatRandomResult(result.result!, message);
    }

    private async handleAddOption(optionArgs: string[], userId: string, message: ChannelMessage) {
        if (optionArgs.length === 0) {
            return this.replyMessageGenerate(
                {
                    messageContent: '❌ Vui lòng cung cấp nội dung lựa chọn!\n💡 Ví dụ: `!giday add pizza`',
                    mk: true,
                },
                message,
            );
        }

        const option = optionArgs.join(' ').trim();
        const result = await this.giDayService.addUserOption(userId, option);
        
        if (!result.success) {
            return this.replyMessageGenerate(
                {
                    messageContent: result.error!,
                    mk: true,
                },
                message,
            );
        }

        const config = this.giDayService.getConfig();
        const lines: string[] = [];
        lines.push('✅ **ĐÃ THÊM LỰA CHỌN**');
        lines.push('');
        lines.push(`➕ **Mới thêm:** ${option}`);
        lines.push(`📊 **Tổng cộng:** ${result.newTotal}/${config.maxOptions} lựa chọn`);
        lines.push('');
        lines.push('💡 **Tiếp theo:**');
        lines.push('   • `!giday add <option>` - Thêm lựa chọn khác');
        lines.push('   • `!giday done` - Random kết quả');
        lines.push('   • `!giday list` - Xem danh sách');

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }

    private async handleDone(userId: string, message: ChannelMessage) {
        const result = await this.giDayService.randomizeAndClearUserOptions(userId);
        
        if (!result.success) {
            return this.replyMessageGenerate(
                {
                    messageContent: result.error!,
                    mk: true,
                },
                message,
            );
        }

        const lines: string[] = [];
        lines.push('🎲 **KẾT QUẢ RANDOM**');
        lines.push('');
        lines.push(`🎯 **Lựa chọn: ${result.result!.chosenOption}**`);
        lines.push('');
        lines.push('📋 **Các lựa chọn ban đầu:**');
        result.result!.allOptions.forEach((option, index) => {
            const prefix = index === result.result!.chosenIndex ? '➡️' : '   •';
            lines.push(`${prefix} ${option}`);
        });
        lines.push('');
        lines.push('🧹 *Danh sách đã được xóa sau khi random*');
        
        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }

    private async handleList(userId: string, message: ChannelMessage) {
        const listResult = await this.giDayService.getUserOptionsList(userId);

        if (listResult.totalOptions === 0) {
            return this.replyMessageGenerate(
                {
                    messageContent: '📋 **DANH SÁCH TRỐNG**\n\n💡 Thêm lựa chọn với: `!giday add <option>`',
                    mk: true,
                },
                message,
            );
        }

        const lines: string[] = [];
        lines.push('📋 **DANH SÁCH LỰA CHỌN**');
        lines.push('');
        listResult.options.forEach((option, index) => {
            lines.push(`   ${index + 1}. ${option}`);
        });
        lines.push('');
        lines.push(`📊 **Tổng cộng:** ${listResult.totalOptions}/${listResult.maxOptions} lựa chọn`);
        lines.push('');
        lines.push('💡 **Thao tác:**');
        lines.push('   • `!giday add <option>` - Thêm lựa chọn');
        lines.push('   • `!giday done` - Random kết quả');
        lines.push('   • `!giday clear` - Xóa hết');

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }

    private async handleClear(userId: string, message: ChannelMessage) {
        const result = await this.giDayService.clearUserOptions(userId);
        
        if (!result.success) {
            return this.replyMessageGenerate(
                {
                    messageContent: result.error!,
                    mk: true,
                },
                message,
            );
        }
        
        if (result.clearedCount === 0) {
            return this.replyMessageGenerate(
                {
                    messageContent: '💭 Danh sách đã trống rồi!',
                    mk: true,
                },
                message,
            );
        }

        return this.replyMessageGenerate(
            {
                messageContent: `🧹 **ĐÃ XÓA HẾT**\n\n📊 Đã xóa ${result.clearedCount} lựa chọn\n💡 Bắt đầu thêm mới với: \`!giday add <option>\``,
                mk: true,
            },
            message,
        );
    }

    private showHelp(message: ChannelMessage) {
        const config = this.giDayService.getConfig();
        const lines: string[] = [];
        lines.push('🎲 **HƯỚNG DẪN GIDAY**');
        lines.push('');
        lines.push('📝 **Cách 1: Random trực tiếp**');
        lines.push('   `!giday pizza, burger, phở, cơm tấm`');
        lines.push('');
        lines.push('📝 **Cách 2: Tạo danh sách từ từ**');
        lines.push('   `!giday add pizza` - Thêm lựa chọn');
        lines.push('   `!giday add burger` - Thêm tiếp');
        lines.push('   `!giday done` - Random kết quả');
        lines.push('');
        lines.push('🔧 **Lệnh khác:**');
        lines.push('   • `!giday list` - Xem danh sách hiện tại');
        lines.push('   • `!giday clear` - Xóa hết và bắt đầu lại');
        lines.push('');
        lines.push(`⚠️ **Giới hạn:** Tối đa ${config.maxOptions} lựa chọn, tự động xóa sau 24h`);

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }

    private formatRandomResult(result: GiDayRandomResult, message: ChannelMessage) {
        const lines: string[] = [];
        lines.push('🎲 **KẾT QUẢ RANDOM**');
        lines.push('');
        lines.push(`🎯 **Lựa chọn: ${result.chosenOption}**`);
        lines.push('');
        lines.push('📋 **Các lựa chọn ban đầu:**');
        result.allOptions.forEach((option, index) => {
            const prefix = index === result.chosenIndex ? '➡️' : '   •';
            lines.push(`${prefix} ${option}`);
        });

        return this.replyMessageGenerate(
            {
                messageContent: lines.join('\n'),
                mk: true,
            },
            message,
        );
    }
}
