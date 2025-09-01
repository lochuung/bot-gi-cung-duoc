import { Injectable } from '@nestjs/common';
import { DishActionHandlers, ActionHandlerResponse } from '@app/handlers/dish-action.handlers';
import { DISH_ADMIN_MESSAGES } from '@app/command/constants/dish-admin.messages';

export type DishActionType = 
    | 'add'
    | 'update' 
    | 'delete'
    | 'del'
    | 'search'
    | 'stats'
    | 'statistics'
    | 'clear-cache'
    | 'help';

@Injectable()
export class DishActionDispatcher {
    private readonly actionMap: Record<string, (args: string[]) => Promise<ActionHandlerResponse>>;

    constructor(private readonly actionHandlers: DishActionHandlers) {
        this.actionMap = {
            'add': this.actionHandlers.addDish.bind(this.actionHandlers),
            'update': this.actionHandlers.updateDish.bind(this.actionHandlers),
            'delete': this.actionHandlers.deleteDish.bind(this.actionHandlers),
            'del': this.actionHandlers.deleteDish.bind(this.actionHandlers),
            'search': this.actionHandlers.searchDishes.bind(this.actionHandlers),
            'stats': () => this.actionHandlers.showStatistics(),
            'statistics': () => this.actionHandlers.showStatistics(),
            'clear-cache': this.actionHandlers.clearUserCache.bind(this.actionHandlers),
            'help': () => Promise.resolve(this.actionHandlers.showHelp()),
        };
    }

    /**
     * Dispatch action to appropriate handler
     */
    async dispatch(action: string, args: string[]): Promise<ActionHandlerResponse> {
        const handler = this.actionMap[action.toLowerCase()];
        
        if (!handler) {
            return this.actionHandlers.showHelp();
        }

        try {
            return await handler(args);
        } catch (error) {
            console.error(`Error executing dish action "${action}":`, error);
            return {
                messageContent: DISH_ADMIN_MESSAGES.ERROR.GENERIC,
                mk: true
            };
        }
    }

    /**
     * Check if action is supported
     */
    isValidAction(action: string): boolean {
        return action.toLowerCase() in this.actionMap;
    }

    /**
     * Get all available actions
     */
    getAvailableActions(): string[] {
        return Object.keys(this.actionMap);
    }
}
