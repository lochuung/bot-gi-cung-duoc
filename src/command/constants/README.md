# Messages Management

Tất cả các message strings của bot được tách ra thành các file riêng để dễ dàng quản lý và thay đổi.

## Cấu trúc Files

### 1. Message Files
- `dish-admin.messages.ts` - Messages cho admin quản lý món ăn
- `giday.messages.ts` - Messages cho tính năng random lựa chọn
- `angi.messages.ts` - Messages cho tính năng gợi ý món ăn
- `messages.ts` - File index export tất cả messages

### 2. Utility Files
- `message-formatter.utils.ts` - Các hàm hỗ trợ format messages

## Cách sử dụng

### Import messages
```typescript
// Import từng loại message
import { DISH_ADMIN_MESSAGES } from '@app/command/constants/dish-admin.messages';
import { GIDAY_MESSAGES } from '@app/command/constants/giday.messages';
import { ANGI_MESSAGES } from '@app/command/constants/angi.messages';

// Hoặc import từ file index
import { DISH_ADMIN_MESSAGES, GIDAY_MESSAGES, ANGI_MESSAGES } from '@app/command/constants/messages';
```

### Sử dụng messages
```typescript
// Simple message
return DISH_ADMIN_MESSAGES.ERROR.DISH_NOT_FOUND;

// Message with parameters
import { formatMessage } from '@app/command/utils/message-formatter.utils';
const message = formatMessage(GIDAY_MESSAGES.ERROR.OPTION_TOO_LONG, { 
    maxLength: '100' 
});
```

### Format với utility functions
```typescript
import { formatMessage, joinMessages, createNumberedList } from '@app/command/utils/message-formatter.utils';

// Format message với parameters
const formatted = formatMessage(GIDAY_MESSAGES.SUCCESS.OPTION_ADDED, {
    option: 'pizza',
    total: '3',
    maxOptions: '20'
});

// Join multiple messages
const combined = joinMessages(
    GIDAY_MESSAGES.ERROR.NO_OPTIONS,
    '',
    GIDAY_MESSAGES.INFO.TIPS.ADD_MORE
);

// Create numbered list
const list = createNumberedList(['pizza', 'burger', 'phở']);
```

## Thêm Messages Mới

### 1. Thêm vào file message tương ứng
```typescript
export const GIDAY_MESSAGES = {
    ERROR: {
        // ... existing messages
        NEW_ERROR: 'New error message with {param}',
    },
    // ...
} as const;
```

### 2. Sử dụng trong code
```typescript
import { GIDAY_MESSAGES } from '@app/command/constants/giday.messages';
import { formatMessage } from '@app/command/utils/message-formatter.utils';

const errorMsg = formatMessage(GIDAY_MESSAGES.ERROR.NEW_ERROR, {
    param: 'value'
});
```

## Lợi ích

1. **Tập trung quản lý**: Tất cả messages ở một nơi, dễ tìm và sửa
2. **Dễ bảo trì**: Thay đổi message không cần tìm khắp codebase
3. **Tái sử dụng**: Messages có thể được dùng ở nhiều nơi
4. **Type-safe**: TypeScript checking cho message keys
5. **i18n ready**: Dễ dàng mở rộng cho đa ngôn ngữ sau này

## Migration từ hardcoded strings

Khi có hardcoded strings cần chuyển:

1. Xác định loại message (error, success, info)
2. Thêm vào file message tương ứng
3. Replace hardcoded string bằng message constant
4. Nếu có parameters, sử dụng `formatMessage()`

## Convention

- Message keys sử dụng UPPER_CASE
- Group messages theo type: ERROR, SUCCESS, INFO, USAGE
- Sử dụng placeholders `{param}` cho dynamic content
- Giữ emoji và formatting trong message constants
