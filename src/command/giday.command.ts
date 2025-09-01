import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { GiDayService, GiDayRandomResult } from '@app/services/giday.service';
import { GIDAY_MESSAGES } from '@app/command/constants/giday.messages';
import { formatMessage, joinMessages, createNumberedList } from '@app/command/utils/message-formatter.utils';

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
                    messageContent: `${GIDAY_MESSAGES.ERROR.MISSING_OPTION_CONTENT}\n${GIDAY_MESSAGES.INFO.TIPS.ADD_MORE}`,
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
        lines.push(GIDAY_MESSAGES.SUCCESS.OPTION_ADDED_HEADER);
        lines.push('');
        lines.push(formatMessage(GIDAY_MESSAGES.SUCCESS.OPTION_ADDED_NEW, { option }));
        lines.push(formatMessage(GIDAY_MESSAGES.INFO.OPTIONS_COUNT, { 
            current: result.newTotal!.toString(),
            max: config.maxOptions.toString()
        }));
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.NEXT_ACTIONS);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.ADD_MORE_SIMPLE}`);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.RANDOM_NOW_SIMPLE}`);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.VIEW_LIST_SIMPLE}`);

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
        lines.push(GIDAY_MESSAGES.SUCCESS.RANDOM_RESULT_HEADER);
        lines.push('');
        lines.push(formatMessage(GIDAY_MESSAGES.SUCCESS.RANDOM_CHOSEN, { option: result.result!.chosenOption }));
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.INITIAL_OPTIONS);
        result.result!.allOptions.forEach((option, index) => {
            const prefix = index === result.result!.chosenIndex ? '➡️' : '   •';
            lines.push(`${prefix} ${option}`);
        });
        lines.push('');
        lines.push(GIDAY_MESSAGES.SUCCESS.RANDOM_CLEARED_NOTE);
        
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
                    messageContent: joinMessages(
                        GIDAY_MESSAGES.INFO.OPTIONS_LIST_EMPTY,
                        '',
                        GIDAY_MESSAGES.INFO.TIPS.ADD_MORE
                    ),
                    mk: true,
                },
                message,
            );
        }

        const lines: string[] = [];
        lines.push(GIDAY_MESSAGES.INFO.OPTIONS_LIST_HEADER);
        lines.push('');
        listResult.options.forEach((option, index) => {
            lines.push(`   ${index + 1}. ${option}`);
        });
        lines.push('');
        lines.push(formatMessage(GIDAY_MESSAGES.INFO.OPTIONS_COUNT, { 
            current: listResult.totalOptions.toString(),
            max: listResult.maxOptions.toString()
        }));
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.AVAILABLE_ACTIONS);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.ADD_MORE_SIMPLE}`);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.RANDOM_NOW_SIMPLE}`);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.CLEAR_ALL_SIMPLE}`);

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
                    messageContent: GIDAY_MESSAGES.SUCCESS.NO_OPTIONS_TO_CLEAR,
                    mk: true,
                },
                message,
            );
        }

        const successMessage = formatMessage(GIDAY_MESSAGES.SUCCESS.OPTIONS_CLEARED, { 
            count: result.clearedCount!.toString() 
        });

        return this.replyMessageGenerate(
            {
                messageContent: joinMessages(
                    successMessage,
                    '',
                    GIDAY_MESSAGES.INFO.TIPS.ADD_MORE
                ),
                mk: true,
            },
            message,
        );
    }

    private showHelp(message: ChannelMessage) {
        const config = this.giDayService.getConfig();
        const lines: string[] = [];
        lines.push(GIDAY_MESSAGES.INFO.HELP_HEADER);
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.HELP_DIRECT_MODE);
        lines.push(`   ${GIDAY_MESSAGES.INFO.TIPS.DIRECT_MODE.replace('⚡ ', '')}`);
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.HELP_LIST_MODE);
        lines.push(`   ${GIDAY_MESSAGES.INFO.TIPS.ADD_MORE.replace('💡 ', '')}`);
        lines.push(`   ${GIDAY_MESSAGES.INFO.EXAMPLES.ADD_BURGER}`);
        lines.push(`   ${GIDAY_MESSAGES.INFO.TIPS.RANDOM_NOW.replace('🎲 ', '')}`);
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.HELP_OTHER_COMMANDS);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.VIEW_LIST.replace('📋 ', '')}`);
        lines.push(`   • ${GIDAY_MESSAGES.INFO.TIPS.CLEAR_ALL.replace('🧹 ', '')}`);
        lines.push('');
        lines.push(formatMessage(GIDAY_MESSAGES.INFO.HELP_LIMITATIONS, { maxOptions: config.maxOptions.toString() }));

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
        lines.push(GIDAY_MESSAGES.SUCCESS.RANDOM_RESULT_HEADER);
        lines.push('');
        lines.push(formatMessage(GIDAY_MESSAGES.SUCCESS.RANDOM_CHOSEN, { option: result.chosenOption }));
        lines.push('');
        lines.push(GIDAY_MESSAGES.INFO.INITIAL_OPTIONS);
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
