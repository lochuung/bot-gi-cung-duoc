export const GIDAY_MESSAGES = {
    ERROR: {
        EMPTY_OPTION: '❌ Lựa chọn không được để trống!',
        OPTION_TOO_LONG: '❌ Lựa chọn quá dài! Tối đa {maxLength} ký tự.',
        OPTION_EXISTS: '❌ Lựa chọn "{option}" đã tồn tại!\n📋 Dùng `!giday list` để xem danh sách hiện tại.',
        MAX_OPTIONS_REACHED: '❌ Đã đạt giới hạn tối đa {maxOptions} lựa chọn!\n🧹 Dùng `!giday clear` để xóa hết và bắt đầu lại.',
        NO_OPTIONS: '❌ Chưa có lựa chọn nào!\n💡 Thêm lựa chọn với: `!giday add <option>`',
        MIN_OPTIONS_REQUIRED: '❌ Cần ít nhất {minOptions} lựa chọn để random!\n💡 Thêm thêm với: `!giday add <option>`',
        MIN_OPTIONS_DIRECT: '❌ Cần ít nhất {minOptions} lựa chọn để random!\n💡 Ví dụ: `!giday pizza, burger, phở`',
        SYSTEM_ERROR: '❌ **Lỗi hệ thống!** Không thể {action}. Vui lòng thử lại.',
    },
    SUCCESS: {
        OPTION_ADDED: '✅ Đã thêm lựa chọn: "{option}"\n📊 Tổng số lựa chọn: {total}/{maxOptions}',
        OPTIONS_CLEARED: '🧹 Đã xóa {count} lựa chọn!',
        NO_OPTIONS_TO_CLEAR: '📝 Danh sách đã trống rồi!',
    },
    INFO: {
        RANDOM_RESULT: '🎲 **Kết quả random:**\n🎯 **Được chọn:** {option}\n📊 **Từ {total} lựa chọn:** {allOptions}',
        OPTIONS_LIST_HEADER: '📋 **Danh sách lựa chọn hiện tại:**',
        OPTIONS_LIST_EMPTY: '📝 Chưa có lựa chọn nào.',
        OPTIONS_COUNT: '📊 Tổng: {current}/{max} lựa chọn',
        TIPS: {
            ADD_MORE: '💡 Thêm lựa chọn: `!giday add <option>`',
            RANDOM_NOW: '🎲 Random ngay: `!giday`',
            VIEW_LIST: '📋 Xem danh sách: `!giday list`',
            CLEAR_ALL: '🧹 Xóa tất cả: `!giday clear`',
            DIRECT_MODE: '⚡ Random trực tiếp: `!giday pizza, burger, phở`',
        },
    },
} as const;
