# Mezon Eatery Bot

A modern, scalable chat bot built with NestJS and TypeScript for the Mezon chat platform.

## 🚀 Features

- **Modern Architecture**: Built with NestJS framework using TypeScript
- **Command System**: Extensible command system with metadata support
- **Event-Driven**: Event-driven architecture with proper separation of concerns
- **Database Integration**: PostgreSQL with TypeORM for data persistence
- **Message Queue**: Efficient message processing with throttling
- **Error Handling**: Comprehensive error handling and logging
- **Modular Design**: Clean, maintainable, and testable code structure

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lochuung/MezonEatery.git
   cd MezonEatery
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=eatery
   MEZON_TOKEN=your_mezon_bot_token
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   pnpm run db:run
   ```

## 🚀 Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

## 🤖 Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!help` | Show available commands | `!help [command]` |
| `!ping` | Check bot latency | `!ping` |
| `!about` | Bot information | `!about` |

## 🏗️ Project Structure

```
src/
├── command/           # Bot commands
│   ├── common/       # Command abstractions
│   ├── help.command.ts
│   ├── ping.command.ts
│   └── about.command.ts
├── common/           # Shared constants and utilities
├── config/           # Configuration files
├── decorators/       # Custom decorators
├── dtos/            # Data transfer objects
├── entities/        # Database entities
├── gateway/         # Event gateways
├── listeners/       # Event listeners
├── modules/         # NestJS modules
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📊 Database

The bot uses PostgreSQL with TypeORM for data persistence. Key entities:

- **User**: Mezon user information
- **CommandUsage**: Command usage analytics
- **MessageLog**: Message processing logs

## 🔧 Development

### Adding New Commands

1. Create a new command file in `src/command/`
2. Extend `CommandMessage` class
3. Use `@Command` decorator with metadata
4. Register in `BotModule`

Example:
```typescript
@Command('example', {
    description: 'An example command',
    usage: '!example [args]',
    category: 'Utility',
})
export class ExampleCommand extends CommandMessage {
    execute(args: string[], message: ChannelMessage) {
        return this.replyMessageGenerate({ 
            messageContent: 'Hello World!' 
        }, message);
    }
}
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 📚 Architecture

### Core Components

- **BotGateway**: Handles Mezon SDK events
- **MessageCommand**: Processes message queue with throttling
- **CommandService**: Routes commands to handlers
- **MessageQueue**: Manages message processing queue

### Design Patterns

- **Command Pattern**: For bot commands
- **Observer Pattern**: For event handling
- **Dependency Injection**: Via NestJS
- **Repository Pattern**: With TypeORM

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t mezon-eatery .

# Run container
docker run -d --name mezon-eatery \
  --env-file .env.production \
  -p 3000:3000 \
  mezon-eatery
```

### Manual Deployment

```bash
# Build application
pnpm run build

# Run production
NODE_ENV=production pnpm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Nguyen Huu Loc**
- GitHub: [@lochuung](https://github.com/lochuung)

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [Mezon SDK](https://github.com/nccasia/mezon-sdk)
- Database with [TypeORM](https://typeorm.io/)