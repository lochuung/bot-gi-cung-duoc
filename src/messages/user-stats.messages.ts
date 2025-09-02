export const USER_STATS_MESSAGES = {
    SUCCESS: {
        HEADER: '📊 **THỐNG KÊ CỦA {username}**',
        RECENT_DISHES_COUNT: '🍽️ **Món đã gợi ý gần đây:** {count}/10',
        RECENT_DISHES_HEADER: '🕒 **Món ăn gần đây:**',
        DISH_ITEM: '   {index}. {name} ({province})',
        MORE_DISHES: '   ... và {count} món khác',
    },
    INFO: {
        NO_CACHE_INFO: '💡 *Các món này sẽ không được gợi ý lại trong 24h*',
        ADMIN_CLEAR_CACHE: '🧹 *Admin có thể xóa cache: `!dish clear-cache {username}`*',
        NO_DISHES_YET: '✨ **Chưa có món nào được gợi ý!**',
        TRY_ANGI_TIP: '💡 *Thử gõ `!angi` để được gợi ý món ăn*',
    },
    ERROR: {
        STATS_ERROR: '❌ **Lỗi khi lấy thống kê!** Vui lòng thử lại.',
    },
    LOG: {
        ERROR_GETTING_USER_STATS: 'Error getting user stats:',
    },
} as const;
