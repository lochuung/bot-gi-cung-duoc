import { ChannelMessage } from 'mezon-sdk';
import { Command } from '@app/decorators/command.decorator';
import { CommandMessage } from '@app/command/common/command.abstract';
import { IsAdmin } from '@app/decorators/admin.decorator';
import { DishActionDispatcher } from '@app/command/services/dish-action-dispatcher.service';

@Command('dish', {
    description: 'Quản lý món ăn (chỉ dành cho admin)',
    usage: `!dish <action> [parameters]
Actions:
  - add <name> <province> <region> <category>: Thêm món ăn mới
  - update <id> <field> <value>: Cập nhật món ăn
  - delete <id>: Xóa món ăn
  - search <term>: Tìm kiếm món ăn
  - stats: Xem thống kê
  - clear-cache <username>: Xóa cache gợi ý cho user`,
    category: 'Admin',
    aliases: ['dishes', 'monan'],
})
@IsAdmin()
export class DishAdminCommand extends CommandMessage {
    constructor(private readonly dishActionDispatcher: DishActionDispatcher) {
        super();
    }

    async execute(args: string[], message: ChannelMessage) {
        // If no arguments, show help
        if (args.length === 0) {
            const response = await this.dishActionDispatcher.dispatch('help', []);
            return this.replyMessageGenerate(response, message);
        }

        const action = args[0].toLowerCase();
        const actionArgs = args.slice(1);

        // Dispatch action to appropriate handler
        const response = await this.dishActionDispatcher.dispatch(action, actionArgs);
        return this.replyMessageGenerate(response, message);
    }
}
