import { CommandMessage } from '@app/command/common/command.abstract';
import { CommandStorage } from '@app/command/common/command.storage';
import { HelpCommand } from '@app/command/help.command';
import { CommandInterface } from '@app/types/command.types';
import { extractMessage } from '@app/utils/message';
import { UserService } from '@app/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ChannelMessage } from 'mezon-sdk';
import { IS_ADMIN_KEY } from '@app/decorators/admin.decorator';

@Injectable()
export class CommandService implements CommandInterface {
    public commandList: { [key: string]: CommandMessage };
    private readonly logger = new Logger(CommandService.name);

    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly userService: UserService,
    ) { }

    async execute(messageContent: string, message: ChannelMessage) {
        const [commandName, args] = extractMessage(messageContent);

        const target = CommandStorage.getCommand(commandName as string);
        if (!target) return;
        const command = this.moduleRef.get(target);
        if (!command) return;

        try {
            const user = await this.userService.findOrCreateUser(message);

            const requireAdmin = Reflect.getMetadata(IS_ADMIN_KEY, target);
            if (requireAdmin && (!user || !user.isAdmin)) {
                this.logger.warn('Unauthorized access attempt:', message);
                return command.replyMessageGenerate(
                    {
                        messageContent: '❌ Bạn không có quyền sử dụng lệnh này.',
                        mk: true,
                    },
                    message,
                );
            }
            command.setUserService(this.userService);
        } catch (error) {
            this.logger.error('Error saving user before command execution:', error);
        }

        return command.execute(args, message);
    }
}