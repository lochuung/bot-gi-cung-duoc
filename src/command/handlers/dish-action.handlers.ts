import { ChannelMessage } from 'mezon-sdk';
import { Injectable } from '@nestjs/common';
import { DishService } from '@app/services/dish.service';
import { DISH_ADMIN_CONSTANTS, DishField } from '@app/command/constants/dish-admin.constants';
import { DISH_ADMIN_MESSAGES } from '@app/command/constants/dish-admin.messages';
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
                messageContent: validation.error || DISH_ADMIN_MESSAGES.USAGE.ADD,
                mk: true
            };
        }

        const newDish = await this.dishService.createDish(validation.data!);
        
        return {
            messageContent: `${DISH_ADMIN_MESSAGES.SUCCESS.DISH_ADDED}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.NAME} ${newDish.name}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.PROVINCE} ${newDish.province}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.REGION} ${newDish.region}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.CATEGORY} ${newDish.category}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.ID} ${newDish.id}`,
            mk: true
        };
    }

    async updateDish(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length < 3) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.USAGE.UPDATE,
                mk: true
            };
        }

        const { id, isValid } = DishValidationUtils.parseId(args[0]);
        if (!isValid) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.INVALID_ID,
                mk: true
            };
        }

        const field = args[1].toLowerCase() as DishField;
        if (!DishValidationUtils.isValidField(field)) {
            return {
                messageContent: `${DISH_ADMIN_MESSAGES.ERROR.INVALID_FIELD} Chỉ được dùng: ${DISH_ADMIN_CONSTANTS.VALID_FIELDS.join(', ')}`,
                mk: true
            };
        }

        const value = args.slice(2).join(' ').replace(/^"|"$/g, '');
        const updateData = { [field]: value };
        
        const updatedDish = await this.dishService.updateDish(id, updateData);
        if (!updatedDish) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.DISH_NOT_FOUND,
                mk: true
            };
        }

        return {
            messageContent: `${DISH_ADMIN_MESSAGES.SUCCESS.DISH_UPDATED}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.NAME} ${updatedDish.name}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.PROVINCE} ${updatedDish.province}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.REGION} ${updatedDish.region}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.CATEGORY} ${updatedDish.category}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.ID} ${updatedDish.id}`,
            mk: true
        };
    }

    async deleteDish(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length === 0) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.USAGE.DELETE,
                mk: true
            };
        }

        const { id, isValid } = DishValidationUtils.parseId(args[0]);
        if (!isValid) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.INVALID_ID,
                mk: true
            };
        }

        const dish = await this.dishService.findDishById(id);
        if (!dish) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.DISH_NOT_FOUND,
                mk: true
            };
        }

        const deleted = await this.dishService.deleteDish(id);
        if (!deleted) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.DELETE_FAILED,
                mk: true
            };
        }

        return {
            messageContent: `${DISH_ADMIN_MESSAGES.SUCCESS.DISH_DELETED}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.NAME} ${dish.name}\n${DISH_ADMIN_MESSAGES.INFO.DISH_DETAILS.ID} ${dish.id}`,
            mk: true
        };
    }

    async searchDishes(args: string[]): Promise<ActionHandlerResponse> {
        if (args.length === 0) {
            return {
                messageContent: DISH_ADMIN_MESSAGES.USAGE.SEARCH,
                mk: true
            };
        }

        const searchTerm = args.join(' ');
        const dishes = await this.dishService.searchDishes(searchTerm, DISH_ADMIN_CONSTANTS.MAX_SEARCH_RESULTS);

        if (dishes.length === 0) {
            return {
                messageContent: `${DISH_ADMIN_MESSAGES.ERROR.NO_SEARCH_RESULTS} "${searchTerm}"`,
                mk: true
            };
        }

        const lines = [`${DISH_ADMIN_MESSAGES.INFO.SEARCH_RESULTS_HEADER} "${searchTerm}"\n`];
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
            `${DISH_ADMIN_MESSAGES.INFO.STATISTICS_HEADER}\n`,
            `${DISH_ADMIN_MESSAGES.INFO.TOTAL_DISHES} ${stats.totalDishes}\n`,
            DISH_ADMIN_MESSAGES.INFO.BY_REGION
        ];

        Object.entries(stats.dishesPerRegion).forEach(([region, count]) => {
            lines.push(`   • ${region}: ${count} món`);
        });

        lines.push(`\n${DISH_ADMIN_MESSAGES.INFO.BY_CATEGORY}`);
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
                messageContent: DISH_ADMIN_MESSAGES.USAGE.CLEAR_CACHE,
                mk: true
            };
        }

        const username = args[0];
        await this.dishService.clearRecentDishes(username);

        return {
            messageContent: `${DISH_ADMIN_MESSAGES.SUCCESS.CACHE_CLEARED} ${username}`,
            mk: true
        };
    }

    showHelp(): ActionHandlerResponse {
        return {
            messageContent: DISH_ADMIN_MESSAGES.HELP,
            mk: true
        };
    }
}
