import { ChannelMessage } from 'mezon-sdk';
import { Injectable } from '@nestjs/common';
import { DishService } from '@app/services/dish.service';
import { DISH_ADMIN_CONSTANTS, DishField } from '@app/command/constants/dish-admin.constants';
import { DishValidationUtils } from '@app/command/utils/dish-validation.utils';

export interface ActionHandlerResponse {
    messageContent: string;
    mk: boolean;
}

@Injectable()
export class DishActionHandlers {
    constructor(private readonly dishService: DishService) {}

    async addDish(args: string[]): Promise<ActionHandlerResponse> {
        const validation = DishValidationUtils.validateDishData(args);
        
        if (!validation.isValid) {
            return {
                messageContent: validation.error || DISH_ADMIN_CONSTANTS.MESSAGES.USAGE.ADD,
                mk: true
            };
        }

        const newDish = await this.dishService.createDish(validation.data!);
        
        return {
            messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.SUCCESS.DISH_ADDED}\n🍽️ **Tên:** ${newDish.name}\n🏙️ **Tỉnh/Thành:** ${newDish.province}\n🗺️ **Miền:** ${newDish.region}\n📋 **Phân loại:** ${newDish.category}\n🆔 **ID:** ${newDish.id}`,
            mk: true
        };
    }

    async updateDish(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length < 3) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.USAGE.UPDATE,
                mk: true
            };
        }

        const { id, isValid } = DishValidationUtils.parseId(args[0]);
        if (!isValid) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.INVALID_ID,
                mk: true
            };
        }

        const field = args[1].toLowerCase() as DishField;
        if (!DishValidationUtils.isValidField(field)) {
            return {
                messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.INVALID_FIELD} Chỉ được dùng: ${DISH_ADMIN_CONSTANTS.VALID_FIELDS.join(', ')}`,
                mk: true
            };
        }

        const value = args.slice(2).join(' ').replace(/^"|"$/g, '');
        const updateData = { [field]: value };
        
        const updatedDish = await this.dishService.updateDish(id, updateData);
        if (!updatedDish) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.DISH_NOT_FOUND,
                mk: true
            };
        }

        return {
            messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.SUCCESS.DISH_UPDATED}\n🍽️ **Tên:** ${updatedDish.name}\n🏙️ **Tỉnh/Thành:** ${updatedDish.province}\n🗺️ **Miền:** ${updatedDish.region}\n📋 **Phân loại:** ${updatedDish.category}\n🆔 **ID:** ${updatedDish.id}`,
            mk: true
        };
    }

    async deleteDish(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length === 0) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.USAGE.DELETE,
                mk: true
            };
        }

        const { id, isValid } = DishValidationUtils.parseId(args[0]);
        if (!isValid) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.INVALID_ID,
                mk: true
            };
        }

        const dish = await this.dishService.findDishById(id);
        if (!dish) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.DISH_NOT_FOUND,
                mk: true
            };
        }

        const deleted = await this.dishService.deleteDish(id);
        if (!deleted) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.DELETE_FAILED,
                mk: true
            };
        }

        return {
            messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.SUCCESS.DISH_DELETED}\n🍽️ **Tên:** ${dish.name}\n🆔 **ID:** ${dish.id}`,
            mk: true
        };
    }

    async searchDishes(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length === 0) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.USAGE.SEARCH,
                mk: true
            };
        }

        const searchTerm = args.join(' ');
        const dishes = await this.dishService.searchDishes(searchTerm, DISH_ADMIN_CONSTANTS.MAX_SEARCH_RESULTS);

        if (dishes.length === 0) {
            return {
                messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.ERROR.NO_SEARCH_RESULTS} "${searchTerm}"`,
                mk: true
            };
        }

        const lines = [`🔍 **Kết quả tìm kiếm cho:** "${searchTerm}"\n`];
        dishes.forEach((dish, index) => {
            lines.push(`${index + 1}. **${dish.name}** (ID: ${dish.id})`);
            lines.push(`   📍 ${dish.province} - ${dish.region}`);
            lines.push(`   📋 ${dish.category}\n`);
        });

        return {
            messageContent: lines.join('\n'),
            mk: true
        };
    }

    async showStatistics(): Promise<ActionHandlerResponse> {
        const stats = await this.dishService.getDishStatistics();

        const lines = [
            '📊 **THỐNG KÊ MÓN ĂN**\n',
            `🍽️ **Tổng số món:** ${stats.totalDishes}\n`,
            '🗺️ **Theo miền:**'
        ];

        Object.entries(stats.dishesPerRegion).forEach(([region, count]) => {
            lines.push(`   • ${region}: ${count} món`);
        });

        lines.push('\n📋 **Theo phân loại:**');
        Object.entries(stats.dishesPerCategory).forEach(([category, count]) => {
            lines.push(`   • ${category}: ${count} món`);
        });

        return {
            messageContent: lines.join('\n'),
            mk: true
        };
    }

    async clearUserCache(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length === 0) {
            return {
                messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.USAGE.CLEAR_CACHE,
                mk: true
            };
        }

        const username = args[0];
        await this.dishService.clearRecentDishes(username);

        return {
            messageContent: `${DISH_ADMIN_CONSTANTS.MESSAGES.SUCCESS.CACHE_CLEARED} ${username}`,
            mk: true
        };
    }

    showHelp(): ActionHandlerResponse {
        return {
            messageContent: DISH_ADMIN_CONSTANTS.MESSAGES.HELP,
            mk: true
        };
    }
}
