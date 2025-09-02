export const MENU_MESSAGES = {
    SUCCESS: {
        HEADER: '🍽️ **MENU CÁC MÓN ĂN CÓ SẴN**',
        REGIONS_HEADER: '🗺️ **Miền:**',
        CATEGORIES_HEADER: '📋 **Phân loại:**',
        USAGE_HEADER: '💡 **Cách sử dụng:**',
        ALIASES_HEADER: '🎯 **Aliases:** `!an`, `!goimon`, `!eat`',
    },
    INFO: {
        USAGE_INSTRUCTIONS: {
            RANDOM: '   • `!angi` - Gợi ý ngẫu nhiên',
            BY_REGION: '   • `!angi miền nam` - Lọc theo miền',
            BY_CATEGORY: '   • `!angi món chính` - Lọc theo phân loại',
            BY_BOTH: '   • `!angi miền nam món chính` - Lọc cả hai',
        },
        BULLET_POINT: '   • {item}',
    },
} as const;