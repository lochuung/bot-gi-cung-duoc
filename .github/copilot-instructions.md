# Mezon Eatery Bot - AI Coding Assistant Instructions

## Project Overview
This is a NestJS-based chat bot for the Mezon platform that suggests Vietnamese food dishes. The bot uses event-driven architecture with command pattern and integrates with PostgreSQL/Redis for data persistence.

## Architecture & Key Components

### Core Event Flow
1. **BotGateway** (`src/gateway/bot.gateway.ts`) - Receives Mezon SDK events and forwards to EventEmitter2
2. **EventListenerChannelMessage** (`src/listeners/channel-message.listener.ts`) - Processes messages starting with `!` prefix
3. **CommandService** (`src/services/command.service.ts`) - Routes commands using reflection-based command registry
4. **MessageQueue** (`src/services/message-queue.service.ts`) - Queues bot responses for throttled delivery
5. **MessageCommand** (`src/services/message-command.service.ts`) - Sends queued messages via Mezon SDK

### Command System Pattern
Commands extend `CommandMessage` abstract class and use `@Command` decorator:

```typescript
@Command('angi', {
    description: 'Gợi ý món ăn ngẫu nhiên',
    usage: '!angi [miền] [phân loại]',
    category: 'Food',
    aliases: ['an', 'goimon', 'eat'],
})
export class AnGiCommand extends CommandMessage {
    constructor(private readonly dishService: DishService) { super(); }
    
    async execute(args: string[], message: ChannelMessage) {
        // Implementation
    }
}
```

**Critical**: Commands are auto-registered via `CommandStorage` metadata system. Register new commands in `BotModule` providers array.

## Development Workflows

### Database Operations
- **Migrations**: `yarn db:generate` (generates), `yarn db:run` (applies)
- **Entity Changes**: Create migration after modifying entities in `src/entities/`
- **Seeding**: Import CSV data via migrations (see `src/migrations/1754878960483-ImportDishesFromCsv.ts`)

### Running & Testing
```bash
# Development with watch mode
yarn start:dev

# Production build
yarn build && yarn start:prod

# TypeORM CLI operations
yarn typeorm migration:create src/migrations/YourMigrationName
```

### Environment Configuration
- Uses environment-specific files: `.env.local`, `.env.prod`
- Config loaded via `src/config/env.config.ts` with Joi validation
- **Required vars**: `POSTGRES_*`, `MEZON_TOKEN`, optional `REDIS_*`

## Project-Specific Conventions

### Message Formatting
- Use `replyMessageGenerate()` helper for consistent message structure
- Vietnamese text with emoji prefixes: `🍽️ **Title**`, `💡 **Tips**`
- Use `mk: true` for markdown formatting in Mezon

### Service Injection Pattern
- Commands receive services via constructor injection
- `UserService` injected separately via `setUserService()` for user tracking
- Database services use TypeORM repositories

### Admin Authorization
Use `@Admin()` decorator on command classes requiring admin privileges:
```typescript
@Admin()
@Command('dish-admin', { /* metadata */ })
export class DishAdminCommand extends CommandMessage {
    // Only admins can execute
}
```

### Error Handling
- Global exception filter in `src/common/filters/global-exception.filter.ts`
- Use structured logging with NestJS Logger
- Return user-friendly error messages in Vietnamese

## Key Integration Points

### Mezon SDK Integration
- Client configuration in `src/config/client.config.ts`
- Event types from `mezon-sdk` package: `Events.ChannelMessage`, etc.
- Message format: `ChannelMessage` interface with `content.t` for text

### Database Schema
- **Users**: Tracks Mezon users with platform metadata and admin flags
- **Dishes**: Vietnamese food data with region/category filtering
- Uses PostgreSQL with `unaccent` extension for Vietnamese search

### Redis Caching
- Configured via `src/config/redis.config.ts`
- Used for caching dish queries and user session data
- Async configuration pattern with `CacheModule.registerAsync()`

## File Organization
- **Commands**: `src/command/` - Bot command implementations
- **Entities**: `src/entities/` - TypeORM database models  
- **Services**: `src/services/` - Business logic and external integrations
- **Config**: `src/config/` - Environment and service configurations
- **Migrations**: `src/migrations/` - Database schema changes

## Testing & Quality
- Jest configuration in `package.json` with `src/` as root directory
- Use TypeScript strict mode with path mapping via `tsconfig.json`
- ESLint + Prettier for code formatting

## Common Patterns to Follow
- Dependency injection over direct imports
- Event-driven communication between modules
- Metadata-driven command registration
- Environment-based configuration loading
- Structured error responses with user context
