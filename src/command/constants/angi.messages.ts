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
        TIPS: {
            USAGE: '💬 *Gõ `!angi` để random toàn bộ hoặc `!angi miền bắc` để lọc theo miền*',
            TRY_AGAIN: '💡 Thử lại với: `!angi` (ngẫu nhiên) hoặc `!angi miền nam`',
        },
    },
} as const;
