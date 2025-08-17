import { DISH_ADMIN_CONSTANTS, DishField } from '@app/command/constants/dish-admin.constants';

export class DishValidationUtils {
    /**
     * Parse and validate ID from string input
     */
    static parseId(idString: string): { id: number; isValid: boolean } {
        const id = parseInt(idString);
        return {
            id,
            isValid: !isNaN(id) && id > 0
        };
    }

    /**
     * Check if field name is valid for dish updates
     */
    static isValidField(field: string): field is DishField {
        return DISH_ADMIN_CONSTANTS.VALID_FIELDS.includes(field as DishField);
    }

    /**
     * Parse command arguments that may contain quoted strings
     * Example: 'add "Phở bò" "Hà Nội" "Miền Bắc"' -> ['Phở bò', 'Hà Nội', 'Miền Bắc']
     */
    static parseQuotedArgs(input: string): string[] {
        const args: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                args.push(current);
                current = '';
                quoteChar = '';
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    args.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            args.push(current);
        }

        return args;
    }

    /**
     * Validate dish data for creation
     */
    static validateDishData(args: string[]): {
        isValid: boolean;
        data?: {
            name: string;
            province: string;
            region: string;
            category: string;
        };
        error?: string;
    } {
        if (args.length < 4) {
            return {
                isValid: false,
                error: 'Cần đủ 4 trường: tên món, tỉnh/thành, miền, phân loại'
            };
        }

        const parsed = this.parseQuotedArgs(args.join(' '));
        
        if (parsed.length < 4) {
            return {
                isValid: false,
                error: 'Cần đủ 4 trường: tên món, tỉnh/thành, miền, phân loại'
            };
        }

        const [name, province, region, category] = parsed;
        
        // Basic validation
        if (!name.trim() || !province.trim() || !region.trim() || !category.trim()) {
            return {
                isValid: false,
                error: 'Tất cả các trường không được để trống'
            };
        }

        return {
            isValid: true,
            data: {
                name: name.trim(),
                province: province.trim(),
                region: region.trim(),
                category: category.trim(),
            }
        };
    }
}
