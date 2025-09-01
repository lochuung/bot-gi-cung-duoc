/**
 * Utility functions for formatting messages with parameters
 */

/**
 * Replace placeholders in message template with actual values
 * @param template - Message template with placeholders like {param}
 * @param params - Object with parameter values
 * @returns Formatted message
 */
export function formatMessage(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key]?.toString() || match;
    });
}

/**
 * Join multiple message parts with newlines
 * @param parts - Array of message parts
 * @returns Joined message
 */
export function joinMessages(...parts: string[]): string {
    return parts.filter(part => part.length > 0).join('\n');
}

/**
 * Create a list message with numbered items
 * @param items - Array of items to list
 * @param startIndex - Starting index (default: 1)
 * @returns Formatted list
 */
export function createNumberedList(items: string[], startIndex: number = 1): string {
    return items.map((item, index) => `   ${index + startIndex}. ${item}`).join('\n');
}

/**
 * Create a bullet list message
 * @param items - Array of items to list
 * @param bullet - Bullet character (default: '•')
 * @returns Formatted list
 */
export function createBulletList(items: string[], bullet: string = '•'): string {
    return items.map(item => `   ${bullet} ${item}`).join('\n');
}
