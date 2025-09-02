export const DIDAUDAY_MESSAGES = {
    ERROR: {
        NO_PLACES_FOUND: '😔 Không tìm thấy địa điểm nào',
        NO_PLACES_WITH_FILTERS: '😔 Không tìm thấy địa điểm nào với điều kiện:',
        SYSTEM_ERROR: '❌ **Lỗi hệ thống!** Không thể tìm địa điểm. Vui lòng thử lại.',
    },
    SUCCESS: {
        SUGGESTION_HEADER: '🌍 **Gợi ý hôm nay:**',
    },
    INFO: {
        PLACE_DETAILS: {
            SUGGESTION: '🌍 **Gợi ý hôm nay: {address}**',
            PROVINCE: '🏞️ Tỉnh/Thành phố:',
            REGION: '🗺️ Miền:',
        },
        FILTER_INFO: '🎯 **Tiêu chí tìm kiếm:**',
        STATISTICS: '📊 Tổng số địa điểm thỏa mãn: **{total}** nơi',
        OTHER_SUGGESTIONS: '💡 **Gợi ý khác:**',
        FILTER_LABELS: {
            REGION: 'Miền:',
            PROVINCE: 'Tỉnh/Thành phố:',
        },
        FILTER_DISPLAY: {
            REGION: '🗺️ Miền: {value}',
            PROVINCE: '🏞️ Tỉnh/Thành phố: {value}',
        },
        FILTER_ITEM: '   • {label} {value}',
        PLACE_DETAIL_ITEM: '{label} {value}',
        SUGGESTION_ITEM: '   {index}. {address} ({province})',
        TIPS: {
            USAGE: '💬 *Gõ `!didauday` để random toàn quốc hoặc `!didauday quảng ninh` để lọc theo tỉnh hoặc thành phố*',
            TRY_AGAIN: '💡 Thử lại với: `!didauday` (ngẫu nhiên) hoặc `!didauday miền bắc`',
        },
    },
    LOG: {
        DATABASE_EMPTY_FALLBACK: 'Database empty, using fallback data',
        ERROR_FINDING_PLACE: 'Error finding random place from database, using fallback:',
        ERROR_GETTING_STATISTICS: 'Error getting tourism statistics:',
        ERROR_CREATING_PLACE: 'Error creating tourism place:',
        ERROR_UPDATING_PLACE: 'Error updating tourism place:',
        ERROR_DELETING_PLACE: 'Error deleting tourism place:',
        ERROR_FINDING_PLACE_BY_ID: 'Error finding tourism place by ID:',
        ERROR_SEARCHING_PLACES: 'Error searching tourism places:',
    },
} as const;
