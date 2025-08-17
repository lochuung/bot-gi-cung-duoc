export const DISH_ADMIN_CONSTANTS = {
    VALID_FIELDS: ['name', 'province', 'region', 'category'] as const,
    MAX_SEARCH_RESULTS: 10,
    MESSAGES: {
        ERROR: {
            MISSING_ARGS: '❌ **Thiếu thông tin!**',
            INVALID_ID: '❌ **ID không hợp lệ!** Vui lòng nhập số.',
            INVALID_FIELD: '❌ **Field không hợp lệ!**',
            DISH_NOT_FOUND: '❌ **Không tìm thấy món ăn với ID này!**',
            DELETE_FAILED: '❌ **Không thể xóa món ăn!** Vui lòng thử lại.',
            NO_SEARCH_RESULTS: '❌ **Không tìm thấy món ăn nào với từ khóa:**',
            GENERIC: '❌ **Đã xảy ra lỗi!** Vui lòng thử lại.',
        },
        SUCCESS: {
            DISH_ADDED: '✅ **Đã thêm món ăn mới:**',
            DISH_UPDATED: '✅ **Đã cập nhật món ăn:**',
            DISH_DELETED: '✅ **Đã xóa món ăn:**',
            CACHE_CLEARED: '✅ **Đã xóa cache gợi ý cho user:**',
        },
        USAGE: {
            ADD: '❌ **Sử dụng:** `!dish add <tên món> <tỉnh/thành> <miền> <phân loại>`\n\n**Ví dụ:** `!dish add "Phở bò" "Hà Nội" "Miền Bắc" "Món Chính"`',
            UPDATE: '❌ **Sử dụng:** `!dish update <id> <field> <value>`\n\n**Fields:** name, province, region, category\n**Ví dụ:** `!dish update 1 name "Phở gà"`',
            DELETE: '❌ **Sử dụng:** `!dish delete <id>`\n\n**Ví dụ:** `!dish delete 1`',
            SEARCH: '❌ **Sử dụng:** `!dish search <từ khóa>`\n\n**Ví dụ:** `!dish search phở`',
            CLEAR_CACHE: '❌ **Sử dụng:** `!dish clear-cache <username>`\n\n**Ví dụ:** `!dish clear-cache john123`',
        },
        HELP: `🛠️ **QUẢN LÝ MÓN ĂN - ADMIN**

**Các lệnh khả dụng:**

📝 **Thêm món:** \`!dish add "<tên món>" "<tỉnh/thành>" "<miền>" "<phân loại>"\`
🔧 **Cập nhật:** \`!dish update <id> <field> <value>\`
🗑️ **Xóa món:** \`!dish delete <id>\`
🔍 **Tìm kiếm:** \`!dish search <từ khóa>\`
📊 **Thống kê:** \`!dish stats\`
🧹 **Xóa cache:** \`!dish clear-cache <username>\`

**Ví dụ:**
\`!dish add "Phở bò" "Hà Nội" "Miền Bắc" "Món Chính"\`
\`!dish update 1 name "Phở gà"\`
\`!dish search phở\``
    }
} as const;

export type DishField = typeof DISH_ADMIN_CONSTANTS.VALID_FIELDS[number];

export interface DishData {
    name: string;
    province: string;
    region: string;
    category: string;
}
