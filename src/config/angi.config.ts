export const AngiConfig = {
  // Số lượng món tối đa lấy từ DB khi random
  MAX_RANDOM_DISHES: 3,

  // Số lượng món gợi ý hiển thị cho user
  MAX_SUGGESTIONS: 2,

  // Số lượng = 0 => DB rỗng
  EMPTY_TOTAL: 0,

  // Danh sách fallback dishes
  FALLBACK_DISHES: [
    { name: 'Bánh bò thốt nốt', province: 'An Giang', region: 'Miền Nam', category: 'Món Chính' },
    { name: 'Cơm cháy chà bông', province: 'An Giang', region: 'Miền Nam', category: 'Món Chính' },
    { name: 'Gà đốt Tri Tôn', province: 'An Giang', region: 'Miền Nam', category: 'Món Chính' },
    { name: 'Phở', province: 'Hà Nội', region: 'Miền Bắc', category: 'Món Chính' },
    { name: 'Bún bò Huế', province: 'Huế', region: 'Miền Trung', category: 'Món Chính' },
  ],

  // Keywords xác định region
  REGION_KEYWORDS: ['miền bắc', 'miền trung', 'miền nam', 'bắc', 'trung', 'nam'],

  // Keywords xác định category
  CATEGORY_KEYWORDS: [
    'món chính',
    'tráng miệng',
    'ăn vặt',
    'đồ uống',
    'chính',
    'tráng',
    'vặt',
    'uống',
  ],
  RECENT_DISHES_TTL: 24 * 60 * 60, // 24 hours
  MAX_RECENT_DISHES: 10,// Maximum recent dishes to track
};