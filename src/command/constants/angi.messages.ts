export const ANGI_MESSAGES = {
    ERROR: {
        NO_DISHES_FOUND: '😔 Không tìm thấy món ăn nào',
        NO_DISHES_WITH_FILTERS: '😔 Không tìm thấy món ăn nào với điều kiện:',
        SYSTEM_ERROR: '❌ **Lỗi hệ thống!** Không thể tìm món ăn. Vui lòng thử lại.',
    },
    SUCCESS: {
        SUGGESTION_HEADER: '🍽️ **Gợi ý hôm nay:**',
    },
    INFO: {
        DISH_DETAILS: {
            NAME: '🍽️ **Gợi ý hôm nay:**',
            PROVINCE: '🏙️ Tỉnh/Thành:',
            REGION: '🗺️ Miền:',
            CATEGORY: '📋 Phân loại:',
        },
        FILTER_INFO: '🎯 **Tiêu chí tìm kiếm:**',
        STATISTICS: '📊 Tổng số món thỏa mãn: **{total}** món',
        OTHER_SUGGESTIONS: '💡 **Gợi ý khác:**',
        FILTER_LABELS: {
            REGION: 'Miền:',
            CATEGORY: 'Phân loại:',
        },
        FILTER_DISPLAY: {
            REGION: '🗺️ {label} {value}',
            CATEGORY: '🍽️ {label} {value}',
        },
        FILTER_ITEM: '   • {label} {value}',
        DISH_DETAIL_ITEM: '{label} {value}',
        SUGGESTION_ITEM: '   {index}. {name} ({province})',
        TIPS: {
            USAGE: '💬 *Gõ `!angi` để random toàn bộ hoặc `!angi miền bắc` để lọc theo miền*',
            TRY_AGAIN: '💡 Thử lại với: `!angi` (ngẫu nhiên) hoặc `!angi miền nam`',
        },
    },
    LOG: {
        DATABASE_EMPTY_FALLBACK: 'Database empty, using fallback data',
        ERROR_FINDING_DISH: 'Error finding random dish from database, using fallback:',
        DATABASE_EMPTY_REGIONS: 'Database empty, using fallback regions',
        ERROR_GETTING_REGIONS: 'Error getting available regions, using fallback:',
        DATABASE_EMPTY_CATEGORIES: 'Database empty, using fallback categories',
        ERROR_GETTING_CATEGORIES: 'Error getting available categories, using fallback:',
        ERROR_GETTING_RECENT_DISHES: 'Error getting recent dishes from Redis:',
        ERROR_SAVING_RECENT_DISH: 'Error saving recent dish to Redis:',
        ERROR_CLEARING_RECENT_DISHES: 'Error clearing recent dishes from Redis:',
        ERROR_GETTING_STATISTICS: 'Error getting dish statistics:',
        ERROR_CREATING_DISH: 'Error creating dish:',
        ERROR_UPDATING_DISH: 'Error updating dish:',
        ERROR_DELETING_DISH: 'Error deleting dish:',
        ERROR_FINDING_DISH_BY_ID: 'Error finding dish by ID:',
        ERROR_SEARCHING_DISHES: 'Error searching dishes:',
        ERROR_GETTING_USER_RECENT_DISHES: 'Error getting recent dishes for user:',
    },
    REDIS_KEYS: {
        RECENT_DISHES_PREFIX: 'recent_dishes:',
    },
} as const;
