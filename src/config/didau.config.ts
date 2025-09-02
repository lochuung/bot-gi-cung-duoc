export const DidauConfig = {
  // Số lượng địa điểm tối đa lấy từ DB khi random
  MAX_RANDOM_PLACES: 3,

  // Số lượng gợi ý hiển thị cho user
  MAX_SUGGESTIONS: 2,

  // Số lượng = 0 => DB rỗng
  EMPTY_TOTAL: 0,

  // Danh sách fallback tourisms (dự phòng khi DB trống)
  FALLBACK_PLACES: [
    { address: 'Chợ nổi Cái Răng', province: 'Cần Thơ', region: 'Miền Nam' },
    { address: 'Núi Bà Đen', province: 'Tây Ninh', region: 'Miền Nam' },
    { address: 'Phú Quốc', province: 'Kiên Giang', region: 'Miền Nam' },
    { address: 'Phố cổ Hội An', province: 'Quảng Nam', region: 'Miền Trung' },
    {
      address: 'Kinh thành Huế',
      province: 'Thừa Thiên Huế',
      region: 'Miền Trung',
    },
    { address: 'Vịnh Hạ Long', province: 'Quảng Ninh', region: 'Miền Bắc' },
    { address: 'Sapa', province: 'Lào Cai', region: 'Miền Bắc' },
  ],

  // Keywords xác định region
  REGION_KEYWORDS: [
    'miền bắc',
    'miền trung',
    'miền nam',
    'bắc',
    'trung',
    'nam',
  ],

  // Keywords xác định province 
  PROVINCE_KEYWORDS: [
    'hà nội',
    'hồ chí minh',
    'sài gòn',
    'cần thơ',
    'đà nẵng',
    'huế',
    'quảng ninh',
    'kiên giang',
    'lào cai',
    'quảng nam',
  ],
  
  RECENT_PLACES_TTL: 24 * 60 * 60, // 24h
  MAX_RECENT_PLACES: 10, // Maximum recent tourism places to track
};
