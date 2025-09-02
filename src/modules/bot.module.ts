import { HelpCommand } from '@app/command/help.command';
import { PingCommand } from '@app/command/ping.command';
import { AboutCommand } from '@app/command/about.command';
import { AnGiCommand } from '@app/command/angi.command';
import { MenuCommand } from '@app/command/menu.command';
import { DishAdminCommand } from '@app/command/dish-admin.command';
import { UserStatsCommand } from '@app/command/user-stats.command';
import { GiDayCommand } from '@app/command/giday.command';
import { ClientConfigService } from '@app/config/client.config';
import { BotGateway } from '@app/gateway/bot.gateway';
import { EventListenerChannelMessage } from '@app/listeners';
import { CommandService } from '@app/services/command.service';
import { MessageCommand } from '@app/services/message-command.service';
import { MessageQueue } from '@app/services/message-queue.service';
import { DishService } from '@app/services/dish.service';
import { UserService } from '@app/services/user.service';
import { RedisService } from '@app/services/redis.service';
import { GiDayService } from '@app/services/giday.service';
import { DishActionHandlers } from '@app/handlers/dish-action.handlers';
import { DishActionDispatcher } from '@app/services/dish-action-dispatcher.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from '@app/entities/dish.entity';
import { User } from '@app/entities/user.entity';
import { TestCommand } from '@app/command/test.command';
import { TourismService } from '@app/services/tourism.service';
import { DidauCommand } from '@app/command/didau.command';
import { Tourism } from '@app/entities/tourism.entity';
import { DidaudayCommand } from '@app/command/didauday.command';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Dish, User, Tourism]),
  ],
  providers: [
    BotGateway,
    ClientConfigService,
    ConfigService,
    CommandService,
    MessageQueue,
    MessageCommand,
    DishService,
    UserService,
    RedisService,
    TourismService,
    GiDayService,

    // Command Services & Handlers
    DishActionHandlers,
    DishActionDispatcher,

    // Listeners
    EventListenerChannelMessage,

    // Commands
    HelpCommand,
    PingCommand,
    AboutCommand,
    AnGiCommand,
    MenuCommand,
    TestCommand,
    DishAdminCommand,
    UserStatsCommand,
    GiDayCommand,
    DidauCommand,
    DidaudayCommand,
  ],
  controllers: [],
})
export class BotModule {}
